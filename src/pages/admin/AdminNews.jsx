import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Table, Input, Form, Upload, message,
  Space, Tag, Tooltip, Popconfirm, Spin, Empty, Descriptions, Modal, Select
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined
} from '@ant-design/icons';
import './AdminNews.css';
import { getAllNews, getNewsById, createNews, updateNews, deleteNews } from './AdminNewsService';

const AdminNews = () => {
  const [form] = Form.useForm();
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [newsDetailVisible, setNewsDetailVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [originalNewsImages, setOriginalNewsImages] = useState({ image: null, banner: null });

  useEffect(() => {
    fetchNews();
  }, []);

  // Fetch news function
  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      const response = await getAllNews();
      console.log("Raw news data received:", response);
      const newsData = response.data || [];
      console.log("News items to be displayed:", newsData);
      setNewsItems(newsData);
    } catch (error) {
      console.error("News fetch error:", error);
      message.error('Failed to load news');
    } finally {
      setNewsLoading(false);
    }
  };

  // Show news details
  const showNewsDetail = (news) => {
    setSelectedNews(news);
    setNewsDetailVisible(true);
  };

  const showModal = (type, record = null) => {
    setModalType(type);
    setIsModalVisible(true);
    form.resetFields();

    if (record && type === 'edit-news') {
      // First set all fields
      form.setFieldsValue({
        id: record.id,
        title: record.title,
        content: record.content,
        status: record.status,
      });
      
      // Store original image/banner URLs in component state for later reference
      setOriginalNewsImages({
        image: record.image,
        banner: record.banner
      });
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const isEdit = modalType === 'edit-news';
      
      const formData = new FormData();
      formData.append('Title', values.title);
      formData.append('Content', values.content);
      formData.append('Status', values.status || 'Published');
      
      if (isEdit) {
        // Make sure to include the ID in the form data
        formData.append('Id', values.id);
        console.log('Updating news with ID:', values.id);
      }
      
      // Handle image file uploads
      if (values.image instanceof File) {
        formData.append('Image', values.image);
      } else if (isEdit && originalNewsImages.image) {
        // If no new image was selected but there was an original image
        formData.append('ExistingImage', originalNewsImages.image);
      }
      
      if (values.banner instanceof File) {
        formData.append('Banner', values.banner);
      } else if (isEdit && originalNewsImages.banner) {
        // If no new banner was selected but there was an original banner
        formData.append('ExistingBanner', originalNewsImages.banner);
      }
      
      try {
        if (isEdit) {
          // Fix the API call to ensure ID is included
          if (!values.id) {
            throw new Error('Cannot update news: ID is missing');
          }
          await updateNews(values.id, formData);
          message.success('News updated successfully!');
        } else {
          await createNews(formData);
          message.success('News created successfully!');
        }
        fetchNews();
        setIsModalVisible(false);
      } catch (error) {
        console.error('Error:', error);
        throw new Error(`Failed to ${isEdit ? 'update' : 'create'} news: ${error.message}`);
      }
    } catch (error) {
      message.error('Operation failed: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      console.log(`About to delete news with ID: ${id}`);
      
      if (!id) {
        message.error('Cannot delete news: ID is missing');
        return;
      }
      
      await deleteNews(id);
      message.success('News deleted successfully!');
      fetchNews();
    } catch (error) {
      console.error("Delete error:", error);
      message.error(`Failed to delete news: ${error.message}`);
    }
  };

  return (
    <div className="admin-news">
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input.Search 
            placeholder="Search news..." 
            style={{ width: 300 }}
            allowClear 
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('add-news')}>
            Add News
          </Button>
        </Space>
        <Table 
          dataSource={newsItems}
          loading={newsLoading}
          rowKey={record => {
            return record.id || record.newsId || record.ID || Math.random().toString(36).substr(2, 9);
          }}
          columns={[
            { title: 'Title', dataIndex: 'title', width: '20%' },
            { 
              title: 'Content', 
              dataIndex: 'content',
              width: '25%',
              ellipsis: true,
              render: content => (
                <Tooltip placement="topLeft" title={content}>
                  {content}
                </Tooltip>
              )
            },
            { 
              title: 'Publish Date', 
              dataIndex: 'publishDate', 
              width: '15%',
              render: (date) => new Date(date).toLocaleDateString() 
            },
            { 
              title: 'Banner', 
              dataIndex: 'banner',
              width: '15%',
              render: (url) => url ? (
                <img 
                  src={url} 
                  alt="banner" 
                  style={{ width: 80, height: 45, objectFit: 'cover', cursor: 'pointer' }} 
                  onClick={() => window.open(url, '_blank')}
                />
              ) : 'No banner'
            },
            { 
              title: 'Status', 
              dataIndex: 'status',
              width: '10%',
              render: (status) => <Tag color="blue">{status}</Tag>
            },
            {
              title: 'Actions',
              width: '15%',
              render: (_, record) => {
                const newsId = record.id || record.newsId || record.ID;
                return (
                  <Space>
                    <Button onClick={() => showNewsDetail(record)}>View</Button>
                    <Button icon={<EditOutlined />} onClick={() => showModal('edit-news', record)} />
                    <Popconfirm
                      title="Are you sure you want to delete this news?"
                      onConfirm={() => handleDelete(newsId)}
                    >
                      <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                  </Space>
                );
              },
            },
          ]}
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
          <div style={{ padding: '0 20px' }}>
            <h2 style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>{selectedNews.title}</h2>
            
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <h3>Content</h3>
                <div style={{ whiteSpace: 'pre-wrap', background: '#f8f8f8', padding: '10px', borderRadius: '4px' }}>
                  {selectedNews.content}
                </div>
              </div>
              
              <Space size="large" align="start">
                <Card title="Banner Image" bordered={false} style={{ width: 300 }}>
                  {selectedNews.banner ? (
                    <img 
                      src={selectedNews.banner} 
                      alt="Banner" 
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                    />
                  ) : (
                    <Empty description="No banner" />
                  )}
                </Card>
                
                <Card title="Thumbnail Image" bordered={false} style={{ width: 300 }}>
                  {selectedNews.image ? (
                    <img 
                      src={selectedNews.image} 
                      alt="Image" 
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                    />
                  ) : (
                    <Empty description="No image" />
                  )}
                </Card>
              </Space>
              
              <Descriptions column={2}>
                <Descriptions.Item label="Publish Date">
                  {new Date(selectedNews.publishDate).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="blue">{selectedNews.status}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Space>
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
            valuePropName="file"
            getValueFromEvent={(e) => e?.fileList?.[0]?.originFileObj}
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
            valuePropName="file"
            getValueFromEvent={(e) => e?.fileList?.[0]?.originFileObj}
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
