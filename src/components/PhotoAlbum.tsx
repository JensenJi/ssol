import { useState } from 'react';
import { Upload, Button, Modal, Image } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

interface PhotoItem {
  id: string;
  url: string;
  caption: string;
}

export default function PhotoAlbum() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [editingCaption, setEditingCaption] = useState<string | null>(null);

  const handleUpload = (file: UploadFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPhoto: PhotoItem = {
        id: Date.now().toString(),
        url: e.target?.result as string,
        caption: '点这里添加照片说明',
      };
      setPhotos((prev) => [...prev, newPhoto]);
    };
    reader.readAsDataURL(file.originFileObj as File);
    return false;
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const updateCaption = (id: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption } : p))
    );
  };

  return (
    <div className="photo-album">
      {/* 上传区域 */}
      <Upload
        listType="picture-card"
        showUploadList={false}
        beforeUpload={handleUpload}
        accept="image/*"
        multiple
      >
        <div className="photo-upload-btn">
          <PlusOutlined style={{ fontSize: 24, color: '#999' }} />
          <div style={{ marginTop: 8, fontSize: 13, color: '#999' }}>点击上传照片</div>
        </div>
      </Upload>

      {/* 照片网格 */}
      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <Image
                src={photo.url}
                alt={photo.caption}
                width="100%"
                height={160}
                style={{ objectFit: 'cover', borderRadius: 8 }}
                preview={false}
                onClick={() => {
                  setPreviewUrl(photo.url);
                  setPreviewOpen(true);
                }}
              />
              <div className="photo-caption">
                {editingCaption === photo.id ? (
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) => updateCaption(photo.id, e.target.value)}
                    onBlur={() => setEditingCaption(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingCaption(null)}
                    className="photo-caption-input"
                    autoFocus
                  />
                ) : (
                  <span onClick={() => setEditingCaption(photo.id)}>
                    {photo.caption}
                  </span>
                )}
              </div>
              <div className="photo-actions">
                <Button
                  size="small"
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => setEditingCaption(photo.id)}
                  title="编辑说明"
                />
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removePhoto(photo.id)}
                  title="删除照片"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}></div>
          <div>还没有照片，点击上方按钮上传</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>支持 JPG、PNG 格式</div>
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
        <img src={previewUrl} alt="预览" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
      </Modal>
    </div>
  );
}
