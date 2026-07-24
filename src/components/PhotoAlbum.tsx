import { useState } from 'react';
import { Upload, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  date: string;
  location: string;
}

export default function PhotoAlbum() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleUpload = (file: UploadFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const newPhoto: PhotoItem = {
        id: Date.now().toString(),
        url: e.target?.result as string,
        caption: '',
        date: dateStr,
        location: '',
      };
      setPhotos((prev) => [...prev, newPhoto]);
    };
    reader.readAsDataURL(file.originFileObj as File);
    return false;
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="photo-album-page">
      {/* 上传区域 */}
      <Upload
        listType="picture-card"
        showUploadList={false}
        beforeUpload={handleUpload}
        accept="image/*"
        multiple
      >
        <div className="photo-upload-btn">
          <PlusOutlined style={{ fontSize: 20 }} />
          <div style={{ marginTop: 4, fontSize: 12 }}>上传照片</div>
        </div>
      </Upload>

      {photos.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#999', fontSize: 14 }}>
          还没有照片，点击上方按钮上传
        </div>
      )}

      {/* A4页面照片网格 - 一行8列 */}
      {photos.length > 0 && (
        <div className="photo-a4-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-thumb-wrapper">
              <div
                className="photo-thumb"
                onClick={() => {
                  setPreviewUrl(photo.url);
                  setPreviewOpen(true);
                }}
              >
                <img src={photo.url} alt={photo.caption} />
              </div>
              <div className="photo-thumb-info">
                <span className="photo-thumb-date">{photo.date}</span>
                {photo.location && <span className="photo-thumb-loc">{photo.location}</span>}
              </div>
              <button
                className="photo-thumb-del"
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(photo.id);
                }}
                title="删除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 大图预览 */}
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width="auto"
        style={{ maxWidth: '90vw' }}
      >
        <img src={previewUrl} alt="预览" style={{ maxWidth: '100%', maxHeight: '85vh', display: 'block', margin: '0 auto' }} />
      </Modal>
    </div>
  );
}
