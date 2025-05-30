using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DBEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "News",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PublishDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Image = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Banner = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_News", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Syllabi",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SlotAmount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Syllabi", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "TypePrograms",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TypePrograms", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConfirmationToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RoleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Accounts_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Classes",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SyllabusID = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Classes", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Classes_Syllabi_SyllabusID",
                        column: x => x.SyllabusID,
                        principalTable: "Syllabi",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SyllabusDetails",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Slot = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Duration = table.Column<int>(type: "int", nullable: false),
                    SyllabusID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SyllabusDetails", x => x.ID);
                    table.ForeignKey(
                        name: "FK_SyllabusDetails_Syllabi_SyllabusID",
                        column: x => x.SyllabusID,
                        principalTable: "Syllabi",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EnrichmentPrograms",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDelete = table.Column<bool>(type: "bit", nullable: false),
                    MaxChildren = table.Column<int>(type: "int", nullable: false),
                    Fee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TypeProgramID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnrichmentPrograms", x => x.ID);
                    table.ForeignKey(
                        name: "FK_EnrichmentPrograms_TypePrograms_TypeProgramID",
                        column: x => x.TypeProgramID,
                        principalTable: "TypePrograms",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Childrens",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Birthday = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Avatar = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BirthCertificate = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EnrollDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Childrens", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Childrens_Accounts_ParentID",
                        column: x => x.ParentID,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Notifications_Accounts_AccountID",
                        column: x => x.AccountID,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClassTeachers",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TeacherID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClassID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassTeachers", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ClassTeachers_Accounts_TeacherID",
                        column: x => x.TeacherID,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassTeachers_Classes_ClassID",
                        column: x => x.ClassID,
                        principalTable: "Classes",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClassChildrens",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChildrenID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClassID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassChildrens", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ClassChildrens_Childrens_ChildrenID",
                        column: x => x.ChildrenID,
                        principalTable: "Childrens",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassChildrens_Classes_ClassID",
                        column: x => x.ClassID,
                        principalTable: "Classes",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EnrollmentApplications",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParentID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AcademicYear = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StaffID = table.Column<int>(type: "int", nullable: false),
                    ProgramID = table.Column<int>(type: "int", nullable: false),
                    ChildrenID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApprovalDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnrollmentApplications", x => x.ID);
                    table.ForeignKey(
                        name: "FK_EnrollmentApplications_Accounts_ParentID",
                        column: x => x.ParentID,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EnrollmentApplications_Childrens_ChildrenID",
                        column: x => x.ChildrenID,
                        principalTable: "Childrens",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EnrollmentApplications_EnrichmentPrograms_ProgramID",
                        column: x => x.ProgramID,
                        principalTable: "EnrichmentPrograms",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Invoices",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccountID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChildrenID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoices", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Invoices_Accounts_AccountID",
                        column: x => x.AccountID,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Invoices_Childrens_ChildrenID",
                        column: x => x.ChildrenID,
                        principalTable: "Childrens",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Attendances",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClassChildrenID = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attendances", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Attendances_ClassChildrens_ClassChildrenID",
                        column: x => x.ClassChildrenID,
                        principalTable: "ClassChildrens",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InvoiceDetails",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvoiceID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProgramID = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ChildrenID = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceDetails", x => x.ID);
                    table.ForeignKey(
                        name: "FK_InvoiceDetails_Childrens_ChildrenID",
                        column: x => x.ChildrenID,
                        principalTable: "Childrens",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InvoiceDetails_EnrichmentPrograms_ProgramID",
                        column: x => x.ProgramID,
                        principalTable: "EnrichmentPrograms",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InvoiceDetails_Invoices_InvoiceID",
                        column: x => x.InvoiceID,
                        principalTable: "Invoices",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_RoleId",
                table: "Accounts",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_ClassChildrenID",
                table: "Attendances",
                column: "ClassChildrenID");

            migrationBuilder.CreateIndex(
                name: "IX_Childrens_ParentID",
                table: "Childrens",
                column: "ParentID");

            migrationBuilder.CreateIndex(
                name: "IX_ClassChildrens_ChildrenID",
                table: "ClassChildrens",
                column: "ChildrenID");

            migrationBuilder.CreateIndex(
                name: "IX_ClassChildrens_ClassID",
                table: "ClassChildrens",
                column: "ClassID");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_SyllabusID",
                table: "Classes",
                column: "SyllabusID");

            migrationBuilder.CreateIndex(
                name: "IX_ClassTeachers_ClassID",
                table: "ClassTeachers",
                column: "ClassID");

            migrationBuilder.CreateIndex(
                name: "IX_ClassTeachers_TeacherID",
                table: "ClassTeachers",
                column: "TeacherID");

            migrationBuilder.CreateIndex(
                name: "IX_EnrichmentPrograms_TypeProgramID",
                table: "EnrichmentPrograms",
                column: "TypeProgramID");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplications_ChildrenID",
                table: "EnrollmentApplications",
                column: "ChildrenID");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplications_ParentID",
                table: "EnrollmentApplications",
                column: "ParentID");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplications_ProgramID",
                table: "EnrollmentApplications",
                column: "ProgramID");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceDetails_ChildrenID",
                table: "InvoiceDetails",
                column: "ChildrenID");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceDetails_InvoiceID",
                table: "InvoiceDetails",
                column: "InvoiceID");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceDetails_ProgramID",
                table: "InvoiceDetails",
                column: "ProgramID");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_AccountID",
                table: "Invoices",
                column: "AccountID");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_ChildrenID",
                table: "Invoices",
                column: "ChildrenID");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_AccountID",
                table: "Notifications",
                column: "AccountID");

            migrationBuilder.CreateIndex(
                name: "IX_SyllabusDetails_SyllabusID",
                table: "SyllabusDetails",
                column: "SyllabusID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Attendances");

            migrationBuilder.DropTable(
                name: "ClassTeachers");

            migrationBuilder.DropTable(
                name: "EnrollmentApplications");

            migrationBuilder.DropTable(
                name: "InvoiceDetails");

            migrationBuilder.DropTable(
                name: "News");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "SyllabusDetails");

            migrationBuilder.DropTable(
                name: "ClassChildrens");

            migrationBuilder.DropTable(
                name: "EnrichmentPrograms");

            migrationBuilder.DropTable(
                name: "Invoices");

            migrationBuilder.DropTable(
                name: "Classes");

            migrationBuilder.DropTable(
                name: "TypePrograms");

            migrationBuilder.DropTable(
                name: "Childrens");

            migrationBuilder.DropTable(
                name: "Syllabi");

            migrationBuilder.DropTable(
                name: "Accounts");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
