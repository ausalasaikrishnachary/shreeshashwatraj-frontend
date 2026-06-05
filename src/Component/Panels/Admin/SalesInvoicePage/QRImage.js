import React from 'react';

const QRImage = ({ src, alt, baseUrl = 'https://gsp.adaequare.com/test/enriched/ei/others/qr/image' }) => {
  if (!src) return <span className="no-data">No QR Image</span>;
  
  return (
    <img 
      src={`${baseUrl}/${src}`} 
      alt={alt} 
      className="qr-image"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = '/placeholder-image.jpg';
      }}
    />
  );
};

export default QRImage;