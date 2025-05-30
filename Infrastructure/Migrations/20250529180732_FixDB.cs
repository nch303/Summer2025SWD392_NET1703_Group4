using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentApplications_EnrichmentPrograms_ProgramID",
                table: "EnrollmentApplications");

            migrationBuilder.DropIndex(
                name: "IX_EnrollmentApplications_ProgramID",
                table: "EnrollmentApplications");

            migrationBuilder.DropColumn(
                name: "ProgramID",
                table: "EnrollmentApplications");

            migrationBuilder.RenameColumn(
                name: "StaffID",
                table: "EnrollmentApplications",
                newName: "GradeLevelID");

            migrationBuilder.AddColumn<Guid>(
                name: "InvoiceID",
                table: "EnrollmentApplications",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "GradeLevels",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Fee = table.Column<double>(type: "float", nullable: false),
                    IsDelete = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GradeLevels", x => x.ID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplications_GradeLevelID",
                table: "EnrollmentApplications",
                column: "GradeLevelID");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplications_InvoiceID",
                table: "EnrollmentApplications",
                column: "InvoiceID",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentApplications_GradeLevels_GradeLevelID",
                table: "EnrollmentApplications",
                column: "GradeLevelID",
                principalTable: "GradeLevels",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentApplications_Invoices_InvoiceID",
                table: "EnrollmentApplications",
                column: "InvoiceID",
                principalTable: "Invoices",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentApplications_GradeLevels_GradeLevelID",
                table: "EnrollmentApplications");

            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentApplications_Invoices_InvoiceID",
                table: "EnrollmentApplications");

            migrationBuilder.DropTable(
                name: "GradeLevels");

            migrationBuilder.DropIndex(
                name: "IX_EnrollmentApplications_GradeLevelID",
                table: "EnrollmentApplications");

            migrationBuilder.DropIndex(
                name: "IX_EnrollmentApplications_InvoiceID",
                table: "EnrollmentApplications");

            migrationBuilder.DropColumn(
                name: "InvoiceID",
                table: "EnrollmentApplications");

            migrationBuilder.RenameColumn(
                name: "GradeLevelID",
                table: "EnrollmentApplications",
                newName: "StaffID");

            migrationBuilder.AddColumn<int>(
                name: "ProgramID",
                table: "EnrollmentApplications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplications_ProgramID",
                table: "EnrollmentApplications",
                column: "ProgramID");

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentApplications_EnrichmentPrograms_ProgramID",
                table: "EnrollmentApplications",
                column: "ProgramID",
                principalTable: "EnrichmentPrograms",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
