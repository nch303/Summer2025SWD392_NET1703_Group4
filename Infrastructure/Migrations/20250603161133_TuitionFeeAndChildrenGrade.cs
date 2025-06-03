using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TuitionFeeAndChildrenGrade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "ProgramID",
                table: "InvoiceDetails",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "TuitionFeeID",
                table: "InvoiceDetails",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GradeLevelID",
                table: "Classes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ChildrenGrades",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChildrenID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GradeLevelID = table.Column<int>(type: "int", nullable: false),
                    AcademicYear = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChildrenGrades", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ChildrenGrades_Childrens_ChildrenID",
                        column: x => x.ChildrenID,
                        principalTable: "Childrens",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChildrenGrades_GradeLevels_GradeLevelID",
                        column: x => x.GradeLevelID,
                        principalTable: "GradeLevels",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TuitionFees",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GradeLevelID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TuitionFees", x => x.ID);
                    table.ForeignKey(
                        name: "FK_TuitionFees_GradeLevels_GradeLevelID",
                        column: x => x.GradeLevelID,
                        principalTable: "GradeLevels",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceDetails_TuitionFeeID",
                table: "InvoiceDetails",
                column: "TuitionFeeID",
                unique: true,
                filter: "[TuitionFeeID] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_GradeLevelID",
                table: "Classes",
                column: "GradeLevelID");

            migrationBuilder.CreateIndex(
                name: "IX_ChildrenGrades_ChildrenID",
                table: "ChildrenGrades",
                column: "ChildrenID");

            migrationBuilder.CreateIndex(
                name: "IX_ChildrenGrades_GradeLevelID",
                table: "ChildrenGrades",
                column: "GradeLevelID");

            migrationBuilder.CreateIndex(
                name: "IX_TuitionFees_GradeLevelID",
                table: "TuitionFees",
                column: "GradeLevelID");

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_GradeLevels_GradeLevelID",
                table: "Classes",
                column: "GradeLevelID",
                principalTable: "GradeLevels",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceDetails_TuitionFees_TuitionFeeID",
                table: "InvoiceDetails",
                column: "TuitionFeeID",
                principalTable: "TuitionFees",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Classes_GradeLevels_GradeLevelID",
                table: "Classes");

            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceDetails_TuitionFees_TuitionFeeID",
                table: "InvoiceDetails");

            migrationBuilder.DropTable(
                name: "ChildrenGrades");

            migrationBuilder.DropTable(
                name: "TuitionFees");

            migrationBuilder.DropIndex(
                name: "IX_InvoiceDetails_TuitionFeeID",
                table: "InvoiceDetails");

            migrationBuilder.DropIndex(
                name: "IX_Classes_GradeLevelID",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "TuitionFeeID",
                table: "InvoiceDetails");

            migrationBuilder.DropColumn(
                name: "GradeLevelID",
                table: "Classes");

            migrationBuilder.AlterColumn<int>(
                name: "ProgramID",
                table: "InvoiceDetails",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
