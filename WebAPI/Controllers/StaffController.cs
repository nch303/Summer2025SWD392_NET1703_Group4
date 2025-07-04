using Application.DTOs.Request;
using Application.DTOs.Response;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;
        private readonly IChildrenService _childrenService;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        private readonly IClassService _classService;
        private readonly IEAService _EAService;
        private readonly IChildrenGradeService _childrenGradeService;
        private readonly IAccountService _accountService;
        private readonly IClassChildrenService _classChildrenService;
        private readonly IInvoiceRepository _invoiceRepository;


        public StaffController(IStaffService staffService, IChildrenService childrenService, IMapper mapper
            , INotificationService notificationService, IClassService classService, IEAService eAService
            , IChildrenGradeService childrenGradeService, IAccountService accountService, IClassChildrenService classChildrenService
            , IInvoiceRepository invoiceRepository)
        {
            _staffService = staffService;
            _childrenService = childrenService;
            _mapper = mapper;
            _notificationService = notificationService;
            _classService = classService;
            _EAService = eAService;
            _childrenGradeService = childrenGradeService;
            _accountService = accountService;
            _classChildrenService = classChildrenService;
            _invoiceRepository = invoiceRepository;
        }

        [HttpGet("GetNotEnrolledChildren")]
        public async Task<IActionResult> GetNotEnrolledChildrenAsync()
        {
            try
            {
                var children = await _childrenService.GetNotEnrolledChildrenAsync();
                var response = _mapper.Map<List<ChildrenResponse>>(children);

                for (int i = 0; i < response.Count(); i++)
                {
                    //Gan ApplicationID cho ChildResponse
                    var application = await _EAService.GetApplicatioinByChildID(response[i].ID);
                    response[i].ApplicationID = application?.ID ?? Guid.Empty;

                    //Gan GradeLevel cho ChildResponse
                    var grade = await _childrenGradeService.GetChildrenGradesByChildrenIdAsync(response[i].ID);
                    if (grade.Count == 0)
                    {
                        response[i].GradeLevelID = 0;
                        response[i].GradeLevelName = string.Empty;
                        continue;
                    }
                    response[i].GradeLevelID = grade[grade.Count - 1]?.GradeLevels!.ID ?? 0;
                    response[i].GradeLevelName = grade[grade.Count - 1]?.GradeLevels!.Name ?? string.Empty;
                }

                response = response.OrderByDescending(c => c.EnrollDate).ToList();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("AssignChildrenToClass/{classId}")]
        public async Task<IActionResult> AssignChildrenToClass(int classId, [FromBody] List<Guid> childrenIds)
        {
            try
            {
                var result = await _staffService.AssignChildrenListToClassAsync(classId, childrenIds);

                // Update the status of each child to "Active"
                foreach (var childId in childrenIds)
                {

                    var application = await _EAService.GetApplicatioinByChildID(childId);
                    application.Status = "Enrolled";
                    await _EAService.UpdateEnrollmentApplicationAsync(application);

                    var child = await _childrenService.GetChildByIdAsync(childId);
                    if (child == null)
                    {
                        return NotFound($"Child with ID {childId} not found.");
                    }
                    child.Status = "Enrolled";
                    await _childrenService.UpdateChildAsync(child);
                }

                //Send notification to parents
                var notificationMessage = "Your child has been successfully assigned to a class.";

                foreach (var childId in childrenIds)
                {
                    var child = await _childrenService.GetChildByIdAsync(childId);
                    var classInfo = await _classService.GetClass(classId);

                    //Update quantity of children in class
                    if (classInfo != null)
                    {
                        classInfo.Quantity += 1;
                        await _classService.UpdateClass(classId, classInfo);
                    }

                    if (child?.Parents != null && classInfo != null)
                    {
                        var accountIDs = new List<Guid>();
                        accountIDs.Add(child.Parents.Id);

                        var notification = new NotificationRequest
                        {
                            AccountIDs = accountIDs,
                            Title = notificationMessage,
                            Content = $"Dear {child.Parents.FullName},\n\nWe are pleased to inform you that your child, {child.Name}, has been successfully assigned to the class \"{classInfo.Name}\".\n\nThank you for your trust and support.\n\n- The School Administration"
                        };

                        await _notificationService.CreateNotificationAsync(notification);
                    }
                }


                return Ok("Assign successfully!");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("reassign-child")]
        public async Task<IActionResult> ReAssignChildToNewClass(Guid childID, int newClassId, int oldClassId)
        {
            try
            {
                var reassign = await _staffService.ReassignChildToNewClassAsync(childID, newClassId, oldClassId);
                return Ok("Re-assign children successfully!!!");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("assign-teacher")]
        public async Task<IActionResult> AssignTeacherToClass(int classId, Guid teacherId)
        {
            try
            {
                var assign = await _staffService.AssignTeacherToClassAsync(classId, teacherId);
                var dto = new AssignTeacherResponse
                {
                    ClassName = assign.Classes!.Name,
                    TeacherName = assign.Teachers!.FullName
                };

                //Send notification to teacher
                var teacherIds = new List<Guid> { teacherId };
                var notificationMessage = "You have been successfully assigned to a class.";
                var teacher = await _accountService.GetAccountByIdAsync(teacherId);
                var notification = new NotificationRequest
                {
                    AccountIDs = teacherIds,
                    Title = notificationMessage,
                    Content = $"Dear {teacher.FullName},\n\nWe are pleased to inform you that you has been successfully assigned to the class \"{dto.ClassName}\".\n\n- The School Administration"
                };

                await _notificationService.CreateNotificationAsync(notification);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("openClass/{classId}")]
        public async Task<IActionResult> OpenClass(int classId)
        {
            try
            {
                var openClass = await _classService.OpenClass(classId);

                //Send notification to parents
                var classChildren = await _classChildrenService.GetChildrenByClassIdAsync(classId);
                var notificationMessage = "Class has been opened. Please check and progress the payment";

                foreach (var classChild in classChildren)
                {
                    var child = await _childrenService.GetChildByIdAsync(classChild.ChildrenID);
                    var classInfo = await _classService.GetClass(classId);

                    if (child?.Parents != null && classInfo != null)
                    {
                        var accountIDs = new List<Guid>();
                        accountIDs.Add(child.Parents.Id);

                        var notification = new NotificationRequest
                        {
                            AccountIDs = accountIDs,
                            Title = notificationMessage,
                            Content = $"Dear {child.Parents.FullName},\n\nWe are pleased to inform you that class {classInfo.Name}, has been successfully opened.\n\nPlease check and progress the payment.\n\n- The School Staff"
                        };

                        await _notificationService.CreateNotificationAsync(notification);
                    }
                }

                return Ok(new { message = "Class is now available" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetTeachersNoClass")]
        public async Task<IActionResult> GetTeachersNoClassAsync()
        {
            try
            {
                var teachers = await _accountService.GetTeachersNoClassAsync();
                var response = _mapper.Map<List<AccountResponse>>(teachers);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetClassesToAssign")]
        public async Task<IActionResult> GetClassesToAssignAsync()
        {
            try
            {
                var classes = await _classService.GetClassesToAssignAsync();
                var response = _mapper.Map<List<ClassResponse>>(classes);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("finish-class")]
        public async Task<IActionResult> FinishClass(List<int> classIds)
        {
            try
            {
                foreach (var classId in classIds)
                {
                    var finishedClass = await _classService.FinishClass(classId);
                }

                return Ok(new { message = "Class has been finished successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("KickClassChildren/{childId}/{classId}")]
        public async Task<IActionResult> KickClassChildren(Guid childId, int classId)
        {
            try
            {
                var existingClass = await _classService.GetClass(classId);
                var result = await _classChildrenService.KickClassChildren(childId, classId);
                if (result)
                {
                    if (existingClass.EnrichmentProgramId == null)
                    {
                        // Update the status of the child to "Not Enrolled"
                        var child = await _childrenService.GetChildByIdAsync(childId);
                        child!.Status = "Temporary";
                        await _childrenService.UpdateChildAsync(child);

                        //Update the quantity of children in the class
                        existingClass.Quantity -= 1;
                        await _classService.UpdateClass(classId, existingClass);

                        //If parent pay the tuition fee, refund the money
                        var application = await _EAService.GetApplicatioinByChildID(childId);
                        var invoices = await _invoiceRepository.GetByAccountIdAsync(child.ParentID);
                        if (invoices != null || invoices.Any())
                        {
                            var invoiceOfChild = invoices!.Where(i => i.Status == "Success" && i.ChildrenID == child.ID && i.ID == application.InvoiceID);
                            var amountToRefund = 0m;
                            if (invoiceOfChild.Any())
                            {
                                foreach (var invoice in invoiceOfChild)
                                {
                                    amountToRefund += invoice.Amount;
                                }

                                // Create a refund invoice
                                if (amountToRefund > 0)
                                {
                                    var refundInvoice = new Invoice
                                    {
                                        ID = Guid.NewGuid(),
                                        AccountID = child.ParentID,
                                        Amount = -amountToRefund,
                                        Status = "Awaiting",
                                        Date = DateTime.UtcNow,
                                        Name = $"Refund for {child.Name}",
                                        ChildrenID = child.ID
                                    };
                                    await _invoiceRepository.CreateAsync(refundInvoice);
                                }
                            }

                            // Send notification to parent about the refund
                            var notificationMessage = "Your child has been removed from the class, and a refund has been processed for the tuition fee paid.";
                            var parent = await _accountService.GetAccountByIdAsync(child.ParentID);
                            if (parent != null)
                            {
                                var notification = new NotificationRequest
                                {
                                    AccountIDs = new List<Guid> { parent.Id },
                                    Title = "Class Removal and Refund",
                                    Content = $"Dear {parent.FullName},\n\nWe regret to inform you that your child, {child.Name}, has been removed from the class. The reason is we do not have enough students to open a new class. A refund of {amountToRefund:C} has been processed for the tuition fee paid.\n\nThank you for your understanding.\n\n- The School Administration"
                                };
                                await _notificationService.CreateNotificationAsync(notification);
                            }
                        }
                        else
                        {
                            // If the parent has not paid the tuition fee, just send a notification
                            var notificationMessage = "Your child has been removed from the class due to insufficient enrollment.";
                            var parent = await _accountService.GetAccountByIdAsync(child.ParentID);
                            if (parent != null)
                            {
                                var notification = new NotificationRequest
                                {
                                    AccountIDs = new List<Guid> { parent.Id },
                                    Title = "Class Removal",
                                    Content = $"Dear {parent.FullName},\n\nWe regret to inform you that your child, {child.Name}, has been removed from the class due to insufficient enrollment. \n\nThank you for your understanding.\n\n- The School Administration"
                                };
                                await _notificationService.CreateNotificationAsync(notification);
                            }
                        }

                        // Update the status of the enrollment application to "Rejected"
                        if (application != null)
                        {
                            application.Status = "Rejected";
                            await _EAService.UpdateEnrollmentApplicationAsync(application);
                        }

                    }

                    return Ok(new { message = "Child has been removed from the class successfully." });
                }
                else
                {
                    return BadRequest(new { message = "Failed to remove child from the class." });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("KickEnrichmentClassChildren/{childId}/{classId}")]
        public async Task<IActionResult> KickEnrichmentClassChildren(Guid childId, int classId)
        {
            try
            {
                var result = await _classChildrenService.KickEnrichmentClassChildren(childId, classId);
                if (result)
                {
                    return Ok(new { message = "Child has been removed from the enrichment class successfully." });
                }
                else
                {
                    return BadRequest(new { message = "Failed to remove child from the enrichment class." });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetInActiveChildrenGrades")]
        public async Task<IActionResult> GetInActiveChildrenGradesAsync()
        {
            try
            {
                var childrenGrades = await _childrenGradeService.GetInActiveChildrenGradeAsync();
                var children = new List<Children>();
                foreach (var grade in childrenGrades)
                {
                    var child = grade.Childrens;
                    if (child != null)
                    {
                        children.Add(child);
                    }
                }
                var response = _mapper.Map<List<ChildrenResponse>>(children);

                for (int i = 0; i < response.Count(); i++)
                {
                    //Gan ApplicationID cho ChildResponse
                    var application = await _EAService.GetApplicatioinByChildID(response[i].ID);
                    response[i].ApplicationID = application?.ID ?? Guid.Empty;

                    //Gan GradeLevel cho ChildResponse
                    var grade = await _childrenGradeService.GetChildrenGradesByChildrenIdAsync(response[i].ID);
                    if (grade.Count == 0)
                    {
                        response[i].GradeLevelID = 0;
                        response[i].GradeLevelName = string.Empty;
                        continue;
                    }
                    response[i].GradeLevelID = grade[grade.Count - 1]?.GradeLevels!.ID ?? 0;
                    response[i].GradeLevelName = grade[grade.Count - 1]?.GradeLevels!.Name ?? string.Empty;
                }

                response = response.OrderBy(c => c.EnrollDate).ToList();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("UpgradeForChildren")]
        public async Task<IActionResult> UpgradeForChildren(List<Guid> childrenIds)
        {
            try
            {
                await _staffService.UpgradeChildren(childrenIds);
                return Ok(new { message = "Children upgraded successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetAwaitingInvoices")]
        public async Task<IActionResult> GetAwaitingRefundInvoicesAsync()
        {
            try
            {
                var awaitingRefundInvoices = await _invoiceRepository.GetAwaitingRefundInvoicesAsync();
                var response = _mapper.Map<List<InvoiceResponse>>(awaitingRefundInvoices);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("ProcessRefund/{invoiceId}")]
        public async Task<IActionResult> ProcessRefund(Guid invoiceId)
        {
            try
            {
                var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
                if (invoice == null)
                {
                    return NotFound(new { message = "Invoice not found." });
                }
                // Process the refund logic here
                invoice.Status = "Refunded";
                await _invoiceRepository.UpdateStatusAsync(invoiceId, invoice.Status);
                // Send notification to the parent
                var parentAccount = await _accountService.GetAccountByIdAsync(invoice.AccountID);
                if (parentAccount != null)
                {
                    var notification = new NotificationRequest
                    {
                        AccountIDs = new List<Guid> { parentAccount.Id },
                        Title = "Refund Processed",
                        Content = $"Dear {parentAccount.FullName},\n\nYour refund for the invoice {invoice.Name} has been processed successfully.\n\n- The School Administration"
                    };
                    await _notificationService.CreateNotificationAsync(notification);
                }
                return Ok(new { message = "Refund processed successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("UpgradeEnrichmentChildren")]
        public async Task<IActionResult> UpgradeEnrichmentChildren(List<Guid> childrenIds, int enrichmentId)
        {
            try
            {
                await _staffService.UpgradeEnrichmentChilren(childrenIds, enrichmentId);
                return Ok(new { message = "Enrichment children upgraded successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
