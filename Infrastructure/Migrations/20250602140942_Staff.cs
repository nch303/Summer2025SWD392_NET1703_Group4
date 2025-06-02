using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Staff : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "StaffID",
                table: "EnrollmentApplications",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplications_StaffID",
                table: "EnrollmentApplications",
                column: "StaffID");

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentApplications_Accounts_StaffID",
                table: "EnrollmentApplications",
                column: "StaffID",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentApplications_Accounts_StaffID",
                table: "EnrollmentApplications");

            migrationBuilder.DropIndex(
                name: "IX_EnrollmentApplications_StaffID",
                table: "EnrollmentApplications");

            migrationBuilder.DropColumn(
                name: "StaffID",
                table: "EnrollmentApplications");
        }
    }
}
