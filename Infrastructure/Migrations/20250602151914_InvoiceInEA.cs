using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InvoiceInEA : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EnrollmentApplications_InvoiceID",
                table: "EnrollmentApplications");

            migrationBuilder.AlterColumn<Guid>(
                name: "InvoiceID",
                table: "EnrollmentApplications",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplications_InvoiceID",
                table: "EnrollmentApplications",
                column: "InvoiceID",
                unique: true,
                filter: "[InvoiceID] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EnrollmentApplications_InvoiceID",
                table: "EnrollmentApplications");

            migrationBuilder.AlterColumn<Guid>(
                name: "InvoiceID",
                table: "EnrollmentApplications",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplications_InvoiceID",
                table: "EnrollmentApplications",
                column: "InvoiceID",
                unique: true);
        }
    }
}
