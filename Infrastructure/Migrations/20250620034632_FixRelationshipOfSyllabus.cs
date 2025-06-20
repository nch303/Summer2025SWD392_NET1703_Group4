using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixRelationshipOfSyllabus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SyllabusDetails_SyllabusID",
                table: "SyllabusDetails");

            migrationBuilder.CreateIndex(
                name: "IX_SyllabusDetails_SyllabusID",
                table: "SyllabusDetails",
                column: "SyllabusID",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SyllabusDetails_SyllabusID",
                table: "SyllabusDetails");

            migrationBuilder.CreateIndex(
                name: "IX_SyllabusDetails_SyllabusID",
                table: "SyllabusDetails",
                column: "SyllabusID");
        }
    }
}
