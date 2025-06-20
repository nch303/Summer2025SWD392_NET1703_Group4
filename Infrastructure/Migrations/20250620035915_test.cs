using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class test : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Classes_EnrichmentPrograms_EnrichmentProgramId",
                table: "Classes");

            migrationBuilder.DropIndex(
                name: "IX_Classes_EnrichmentProgramId",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "EnrichmentProgramId",
                table: "Classes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EnrichmentProgramId",
                table: "Classes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Classes_EnrichmentProgramId",
                table: "Classes",
                column: "EnrichmentProgramId");

            migrationBuilder.AddForeignKey(
                name: "FK_Classes_EnrichmentPrograms_EnrichmentProgramId",
                table: "Classes",
                column: "EnrichmentProgramId",
                principalTable: "EnrichmentPrograms",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
