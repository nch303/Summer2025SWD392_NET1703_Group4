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
import { getAllNews, getNewsById, createNews, updateNews, deleteNews, searchNews, updateNewsStatus } from '../../services/AdminService';

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
  }, [showDeleted]);

  // Fetch news function
  const fetchNews = async (page = pagination.current, pageSize = pagination.pageSize) => {
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
        total: totalCount,
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
    // If search is empty, just reset to normal view
    if (!value || value.trim() === '') {
      setSearchKeyword('');
      setIsSearching(false);
      return fetchNews();
    }
    
    try {
      setNewsLoading(true);
      setSearchKeyword(value);
      
      // Call the search API
      const response = await searchNews(value);
      
      console.log("Search response:", response); // Debug the response structure
      
      // Check if we have results
      // Note: The structure might be just 'response' or 'response.data' depending on your API
      const searchResults = response.data || response || [];
      
      if (searchResults && searchResults.length > 0) {
        // Filter out deleted news unless showDeleted is true
        const filteredData = showDeleted
          ? searchResults
          : searchResults.filter(item => item.status !== 'Deleted');
          
        setNewsItems(filteredData);
        setPagination({
          ...pagination,
          total: filteredData.length,
          current: 1 // Reset to page 1 for search results
        });
      } else {
        setNewsItems([]);
        setPagination({
          ...pagination,
          total: 0,
          current: 1
        });
        message.info('No news found matching your search');
      }
      setIsSearching(true);
    } catch (error) {
      console.error("Search error:", error);
      message.error('Failed to search news');
      setNewsItems([]);
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
    form.resetFields();
    
    // Reset original images
    setOriginalNewsImages({ image: null, banner: null });
    
    if (record && type === 'edit-news') {
      try {
        setNewsLoading(true);
        const newsDetail = await getNewsById(record.id);
        
        // Set form fields
        form.setFieldsValue({
          id: newsDetail.id,
          title: newsDetail.title,
          content: newsDetail.content,
          status: newsDetail.status || 'Published',
        });
        
        // Store original image URLs
        setOriginalNewsImages({
          image: newsDetail.image,
          banner: newsDetail.banner
        });
        
        // Set image fileList if exists
        if (newsDetail.image) {
          form.setFieldsValue({
            image: [{
              uid: '-1',
              name: 'current-image.jpg',
              status: 'done',
              url: newsDetail.image,
            }]
          });
        }
        
        // Set banner fileList if exists
        if (newsDetail.banner) {
          form.setFieldsValue({
            banner: [{
              uid: '-1',
              name: 'current-banner.jpg',
              status: 'done',
              url: newsDetail.banner,
            }]
          });
        }
        
      } catch (error) {
        console.error("Failed to fetch news details:", error);
        message.error("Could not load news information");
      } finally {
        setNewsLoading(false);
      }
    }
    
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const isEdit = modalType === 'edit-news';
      
      // Create FormData
      const formData = new FormData();
      formData.append('Title', values.title);
      formData.append('Content', values.content);
      formData.append('Status', values.status || 'Published');
      
      // Get current date/time in Vietnam timezone (GMT+7)
      const now = new Date();
      // Convert to Vietnam time (UTC+7)
      const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
      const formattedDate = vietnamTime.toISOString();
      formData.append('PublishDate', formattedDate);
      
      if (isEdit) {
        formData.append('Id', values.id);
      }
      
      // Handle image file
      if (values.image && values.image[0]) {
        if (values.image[0].originFileObj) {
          // New file uploaded
          formData.append('Image', values.image[0].originFileObj);
        } else if (isEdit && originalNewsImages.image) {
          // Existing image from server
          formData.append('ExistingImage', originalNewsImages.image);
        }
      }
      
      // Handle banner file
      if (values.banner && values.banner[0]) {
        if (values.banner[0].originFileObj) {
          // New file uploaded
          formData.append('Banner', values.banner[0].originFileObj);
        } else if (isEdit && originalNewsImages.banner) {
          // Existing banner from server
          formData.append('ExistingBanner', originalNewsImages.banner);
        }
      }
      
      setNewsLoading(true);
      
      try {
        if (isEdit) {
          await updateNews(values.id, formData);
          message.success('News updated successfully!');
          // Refresh current page data
          fetchNews(pagination.current, pagination.pageSize);
        } else {
          await createNews(formData);
          message.success('News added successfully!');
          // Go to page 1 only for new items
          fetchNews(1, pagination.pageSize);
        }
        
        setIsModalVisible(false);
      } catch (error) {
        console.error('Error:', error);
        message.error(`Failed to update news: ${error.message || 'Unknown error'}`);
      } finally {
        setNewsLoading(false);
      }
    } catch (error) {
      message.error('Operation failed: ' + error.message);
    }
  };

  const handleSoftDelete = async (id) => {
    try {
      if (!id) {
        message.error('Cannot delete news: ID is missing');
        return;
      }
      
      // Get the current news item to send all required fields
      const newsDetail = await getNewsById(id);
      
      // Create FormData for the update
      const formData = new FormData();
      formData.append('Id', id);
      formData.append('Title', newsDetail.title);
      formData.append('Content', newsDetail.content);
      formData.append('Status', 'Deleted');  // Change status to Deleted
      
      if (newsDetail.image) {
        formData.append('ExistingImage', newsDetail.image);
      }
      
      if (newsDetail.banner) {
        formData.append('ExistingBanner', newsDetail.banner);
      }
      
      // Get current date in Vietnam timezone
      const now = new Date();
      const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
      const formattedDate = vietnamTime.toISOString();
      formData.append('PublishDate', formattedDate);
      
      // Use the regular update endpoint
      await updateNews(id, formData);
      message.success('News has been moved to trash');
      fetchNews(pagination.current, pagination.pageSize);
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
      
      // Get the current news item to send all required fields
      const newsDetail = await getNewsById(id);
      
      // Create FormData for the update
      const formData = new FormData();
      formData.append('Id', id);
      formData.append('Title', newsDetail.title);
      formData.append('Content', newsDetail.content);
      formData.append('Status', 'Published');
      
      if (newsDetail.image) {
        formData.append('ExistingImage', newsDetail.image);
      }
      
      if (newsDetail.banner) {
        formData.append('ExistingBanner', newsDetail.banner);
      }
      
      // Get current date in Vietnam timezone
      const now = new Date();
      const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
      const formattedDate = vietnamTime.toISOString();
      formData.append('PublishDate', formattedDate);
      
      // Use the regular update endpoint
      await updateNews(id, formData);
      message.success('News has been restored successfully');
      fetchNews(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Restore error:", error);
      message.error(`Failed to restore news: ${error.message}`);
    }
  };

  // Toggle showing deleted items
  const toggleShowDeleted = (checked) => {
    setShowDeleted(checked);
    // Reset to page 1 when toggling deleted items
    fetchNews(1, pagination.pageSize);
  };

  return (
    <div className="admin-news">
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input.Search 
            placeholder="Search news..." 
            style={{ width: 300 }}
            allowClear 
            onSearch={handleSearch}
            loading={newsLoading && isSearching}
            enterButton={<Button icon={<SearchOutlined />}>Search</Button>}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('add-news')}>
            Add news
          </Button>
          <Space>
            <Switch
              checked={showDeleted}
              onChange={toggleShowDeleted}
              checkedChildren="Show deleted news"
              unCheckedChildren="Hide deleted news"
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
              if (Array.isArray(e)) return e;
              return e && e.fileList ? e.fileList : [];
            }}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              listType="picture"
              accept="image/*"
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
              if (Array.isArray(e)) return e;
              return e && e.fileList ? e.fileList : [];
            }}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              listType="picture"
              accept="image/*"
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