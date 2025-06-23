import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Table, Input, Form, Upload, message,
  Space, Tag, Tooltip, Popconfirm, Spin, Empty, Descriptions, Modal, Select, Switch
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, SearchOutlined,
  UndoOutlined, EyeOutlined
} from '@ant-design/icons';
import './AdminNews.css';
import { getAllNews, getNewsById, createNews, updateNews, deleteNews, searchNews, updateNewsStatus } from './AdminNewsService';

const AdminNews = () => {
  const [form] = Form.useForm();
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [newsDetailVisible, setNewsDetailVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [originalNewsImages, setOriginalNewsImages] = useState({ image: null, banner: null });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  // Fetch news function
  const fetchNews = async (page = 1, pageSize = 10) => {
    try {
      setNewsLoading(true);
      const response = await getAllNews(page, pageSize);
      
      // Extract data based on API response format
      const { totalCount, pageNumber, pageSize: responsePageSize, data } = response;
      
      // Filter out deleted news unless showDeleted is true
      const filteredData = showDeleted 
        ? data || []
        : (data || []).filter(item => item.status !== 'Deleted');
      
      setNewsItems(filteredData);
      setPagination({
        total: filteredData.length,
        current: pageNumber,
        pageSize: responsePageSize
      });
      setIsSearching(false);
    } catch (error) {
      console.error("News fetch error:", error);
      message.error('Failed to load news');
    } finally {
      setNewsLoading(false);
    }
  };

  // Search news function
  const handleSearch = async (value) => {
    if (!value) {
      setSearchKeyword('');
      setIsSearching(false);
      return fetchNews();
    }
    
    try {
      setNewsLoading(true);
      setSearchKeyword(value);
      const response = await searchNews(value);
      
      if (response && response.data) {
        // Filter out deleted news unless showDeleted is true
        const filteredData = showDeleted
          ? response.data
          : response.data.filter(item => item.status !== 'Deleted');
          
        setNewsItems(filteredData);
        setPagination({
          ...pagination,
          total: filteredData.length
        });
      } else {
        setNewsItems([]);
      }
      setIsSearching(true);
    } catch (error) {
      console.error("Search error:", error);
      message.error('Failed to search news');
    } finally {
      setNewsLoading(false);
    }
  };

  // Show news details
  const showNewsDetail = async (news) => {
    try {
      setNewsLoading(true);
      // Fetch detailed news information using getNewsById
      const newsDetail = await getNewsById(news.id);
      setSelectedNews(newsDetail);
      setNewsDetailVisible(true);
    } catch (error) {
      console.error("Error fetching news details:", error);
      message.error('Failed to load news details');
    } finally {
      setNewsLoading(false);
    }
  };

  const showModal = async (type, record = null) => {
    setModalType(type);
    setIsModalVisible(true);
    form.resetFields();

    if (record && type === 'edit-news') {
      try {
        setNewsLoading(true);
        // Fetch đầy đủ dữ liệu tin tức để hiển thị trong form edit
        const newsDetail = await getNewsById(record.id);
        
        // Điền các trường dữ liệu vào form
        form.setFieldsValue({
          id: newsDetail.id,
          title: newsDetail.title,
          content: newsDetail.content,
          status: newsDetail.status || 'Published',
        });
        
        // Lưu URLs của ảnh và banner
        setOriginalNewsImages({
          image: newsDetail.image,
          banner: newsDetail.banner
        });
        
        setNewsLoading(false);
      } catch (error) {
        console.error("Failed to fetch news details for editing:", error);
        message.error("Không thể tải thông tin tin tức");
        setNewsLoading(false);
      }
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const isEdit = modalType === 'edit-news';
      
      // Tạo FormData để xử lý tệp tin
      const formData = new FormData();
      formData.append('Title', values.title);
      formData.append('Content', values.content);
      formData.append('Status', values.status || 'Published');
      
      // Luôn sử dụng ngày giờ hiện tại của Việt Nam (GMT+7) cho cả create và update
      const now = new Date();
      // Tính toán múi giờ Việt Nam (UTC+7)
      const vietnamTime = new Date(now.getTime());
      // Để đảm bảo múi giờ chính xác, sử dụng options khi chuyển đổi thành chuỗi
      const formattedDate = vietnamTime.toISOString();
      formData.append('PublishDate', formattedDate);
      
      if (isEdit) {
        formData.append('Id', values.id);
      }
      
      // Xử lý upload hình ảnh thumbnail
      const imageFile = values.image?.fileList?.[0]?.originFileObj;
      if (imageFile) {
        formData.append('Image', imageFile);
      } else if (isEdit && originalNewsImages.image) {
        // Giữ ảnh cũ, không gửi file mới
        formData.append('Image', null);
        formData.append('ExistingImage', originalNewsImages.image);
      }
      
      // Xử lý upload banner
      const bannerFile = values.banner?.fileList?.[0]?.originFileObj;
      if (bannerFile) {
        formData.append('Banner', bannerFile);
      } else if (isEdit && originalNewsImages.banner) {
        // Giữ banner cũ, không gửi file mới
        formData.append('Banner', null);
        formData.append('ExistingBanner', originalNewsImages.banner);
      }
      
      console.log('Form data entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
      }
      
      try {
        setNewsLoading(true);
        
        if (isEdit) {
          if (!values.id) {
            throw new Error('Cannot update news: ID is missing');
          }
          await updateNews(values.id, formData);
          message.success('Cập nhật tin tức thành công!');
        } else {
          await createNews(formData);
          message.success('Thêm tin tức thành công!');
        }
        
        fetchNews();
        setIsModalVisible(false);
      } catch (error) {
        console.error('Error:', error);
        message.error(`${isEdit ? 'Cập nhật' : 'Thêm'} tin tức thất bại: ${error.message || 'Lỗi không xác định'}`);
      } finally {
        setNewsLoading(false);
      }
    } catch (error) {
      message.error('Thao tác thất bại: ' + error.message);
    }
  };

  const handleSoftDelete = async (id) => {
    try {
      if (!id) {
        message.error('Cannot delete news: ID is missing');
        return;
      }
      
      await updateNewsStatus(id, 'Deleted');
      message.success('News has been moved to trash');
      fetchNews();
    } catch (error) {
      console.error("Delete error:", error);
      message.error(`Failed to delete news: ${error.message}`);
    }
  };

  const handleRestore = async (id) => {
    try {
      if (!id) {
        message.error('Cannot restore news: ID is missing');
        return;
      }
      
      await updateNewsStatus(id, 'Published');
      message.success('News has been restored successfully');
      fetchNews();
    } catch (error) {
      console.error("Restore error:", error);
      message.error(`Failed to restore news: ${error.message}`);
    }
  };

  // Toggle showing deleted items
  const toggleShowDeleted = (checked) => {
    setShowDeleted(checked);
    fetchNews();
  };

  // Reset search and return to normal list
  const handleClearSearch = () => {
    setSearchKeyword('');
    setIsSearching(false);
    fetchNews();
  };

  return (
    <div className="admin-news">
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input.Search 
            placeholder="Tìm kiếm tin tức..." 
            style={{ width: 300 }}
            allowClear 
            onSearch={handleSearch}
            loading={newsLoading && isSearching}
            enterButton={<Button icon={<SearchOutlined />}>Tìm kiếm</Button>}
          />
          {isSearching && (
            <Button onClick={handleClearSearch}>
              Xóa tìm kiếm
            </Button>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('add-news')}>
            Thêm tin tức
          </Button>
          <Space>
            <Switch
              checked={showDeleted}
              onChange={toggleShowDeleted}
              checkedChildren="Hiện tin đã xóa"
              unCheckedChildren="Ẩn tin đã xóa"
            />
          </Space>
        </Space>
        <Table 
          dataSource={newsItems}
          loading={newsLoading}
          rowKey="id"
          columns={[
            { 
              title: 'ID', 
              dataIndex: 'id', 
              width: '10%' 
            },
            { 
              title: 'Title', 
              dataIndex: 'title', 
              width: '40%' 
            },
            { 
              title: 'Status',
              dataIndex: 'status',
              width: '10%',
              render: (status) => (
                <Tag color={
                  status === 'Published' ? 'green' : 
                  status === 'Draft' ? 'orange' : 
                  status === 'Deleted' ? 'red' : 'default'
                }>
                  {status || 'N/A'}
                </Tag>
              )
            },
            { 
              title: 'Image', 
              dataIndex: 'image',
              width: '20%',
              render: (url) => url ? (
                <img 
                  src={url} 
                  alt="thumbnail" 
                  style={{ width: 80, height: 45, objectFit: 'cover', cursor: 'pointer' }} 
                  onClick={() => window.open(url, '_blank')}
                />
              ) : 'No image'
            },
            {
              title: 'Actions',
              width: '20%',
              render: (_, record) => (
                <Space>
                  <Button 
                    icon={<EyeOutlined />}
                    onClick={() => showNewsDetail(record)}
                    size="small"
                    title="View"
                  />
                  {record.status !== 'Deleted' ? (
                    <>
                      <Button 
                        icon={<EditOutlined />} 
                        onClick={() => showModal('edit-news', record)}
                        size="small"
                        title="Edit"
                      />
                      <Popconfirm
                        title="Are you sure you want to delete this news?"
                        onConfirm={() => handleSoftDelete(record.id)}
                      >
                        <Button 
                          icon={<DeleteOutlined />} 
                          danger 
                          size="small"
                          title="Delete"
                        />
                      </Popconfirm>
                    </>
                  ) : (
                    <Popconfirm
                      title="Are you sure you want to restore this news?"
                      onConfirm={() => handleRestore(record.id)}
                    >
                      <Button 
                        icon={<UndoOutlined />} 
                        type="primary"
                        size="small"
                        title="Restore"
                      >
                        Restore
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
              ),
            },
          ]}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => fetchNews(page, pageSize)
          }}
        />
      </Card>
      
      {/* News Detail Modal */}
      <Modal
        title="News Details"
        open={newsDetailVisible}
        onCancel={() => setNewsDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setNewsDetailVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedNews && (
          <div className="news-detail-container">
            <h2 className="news-title">{selectedNews.title}</h2>
            
            <Descriptions bordered column={1}>
              <Descriptions.Item label="ID">{selectedNews.id}</Descriptions.Item>
              <Descriptions.Item label="Content">
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedNews.content}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Publish Date">
                {selectedNews.publishDate ? new Date(selectedNews.publishDate).toLocaleString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedNews.status === 'Published' ? 'green' : 'orange'}>
                  {selectedNews.status || 'N/A'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <h3>Thumbnail Image</h3>
                {selectedNews.image ? (
                  <div style={{ border: '1px solid #f0f0f0', padding: '8px', borderRadius: '4px' }}>
                    <img 
                      src={selectedNews.image} 
                      alt="Thumbnail" 
                      style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }} 
                    />
                  </div>
                ) : (
                  <Empty description="No thumbnail image" />
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <h3>Banner Image</h3>
                {selectedNews.banner ? (
                  <div style={{ border: '1px solid #f0f0f0', padding: '8px', borderRadius: '4px' }}>
                    <img 
                      src={selectedNews.banner} 
                      alt="Banner" 
                      style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }} 
                    />
                  </div>
                ) : (
                  <Empty description="No banner image" />
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Add/Edit News Modal */}
      <Modal
        title={modalType === 'add-news' ? 'Add New News' : 'Edit News'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter news title' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="Content" rules={[{ required: true, message: 'Please enter news content' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="image"
            label="Image"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              listType="picture"
              accept="image/*"
              fileList={modalType === 'edit-news' && originalNewsImages?.image ? [
                {
                  uid: '-1',
                  name: 'Current Image',
                  status: 'done',
                  url: originalNewsImages.image,
                }
              ] : []}
            >
              <Button icon={<UploadOutlined />}>
                {modalType === 'edit-news' ? 'Change Image' : 'Upload Image'}
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="banner"
            label="Banner Image"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              listType="picture"
              accept="image/*"
              fileList={modalType === 'edit-news' && originalNewsImages?.banner ? [
                {
                  uid: '-1',
                  name: 'Current Banner',
                  status: 'done',
                  url: originalNewsImages.banner,
                }
              ] : []}
            >
              <Button icon={<UploadOutlined />}>
                {modalType === 'edit-news' ? 'Change Banner' : 'Upload Banner'}
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select a status' }]}>
            <Select>
              <Select.Option value="Published">Published</Select.Option>
              <Select.Option value="Draft">Draft</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminNews;