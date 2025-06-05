using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class fixRelationshipTuitionAndInvoiceDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceDetails_TuitionFees_TuitionFeeID",
                table: "InvoiceDetails");

            migrationBuilder.DropIndex(
                name: "IX_InvoiceDetails_TuitionFeeID",
                table: "InvoiceDetails");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceDetails_TuitionFeeID",
                table: "InvoiceDetails",
                column: "TuitionFeeID");

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceDetails_TuitionFees_TuitionFeeID",
                table: "InvoiceDetails",
                column: "TuitionFeeID",
                principalTable: "TuitionFees",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceDetails_TuitionFees_TuitionFeeID",
                table: "InvoiceDetails");

            migrationBuilder.DropIndex(
                name: "IX_InvoiceDetails_TuitionFeeID",
                table: "InvoiceDetails");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceDetails_TuitionFeeID",
                table: "InvoiceDetails",
                column: "TuitionFeeID",
                unique: true,
                filter: "[TuitionFeeID] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceDetails_TuitionFees_TuitionFeeID",
                table: "InvoiceDetails",
                column: "TuitionFeeID",
                principalTable: "TuitionFees",
                principalColumn: "ID");
        }
    }
}
