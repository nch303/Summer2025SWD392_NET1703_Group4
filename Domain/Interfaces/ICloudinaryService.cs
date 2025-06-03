namespace Application.Interfaces
{
    public interface ICloudinaryService
    {
        Task<string> UploadImageAsync(Stream fileStream, string fileName);
        Task<string> UploadVideoAsync(Stream fileStream, string fileName);
    }

}
