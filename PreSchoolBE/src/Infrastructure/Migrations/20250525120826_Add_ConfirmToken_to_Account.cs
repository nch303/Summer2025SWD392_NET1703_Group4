using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PreSchoolBE.Migrations
{
    /// <inheritdoc />
    public partial class Add_ConfirmToken_to_Account : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ConfirmationToken",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConfirmationToken",
                table: "Accounts");
        }
    }
}
