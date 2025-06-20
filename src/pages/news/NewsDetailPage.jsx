import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { getNewsDetail } from './NewsService';

const NewsDetailPage = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // TODO: Gọi API lấy chi tiết tin tức theo id
    // getNewsDetail(id).then(setNews).catch(setError).finally(() => setLoading(false));
    setLoading(false);
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!news) return <div>No news found.</div>;

  return (
    <div className="news-detail-page">
      <h1>{news.title}</h1>
      <p>{news.date}</p>
      <img src={news.image} alt={news.title} />
      <div>{news.content}</div>
    </div>
  );
};

export default NewsDetailPage; 