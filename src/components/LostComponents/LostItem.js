import React from 'react';
import './LostCss/LostItem.css';

const defaultImage = process.env.PUBLIC_URL + '/images/lost/Lost.png';

export default function LostItem({ item, onClick }) {
  const imageUrl = item.fdFilePathImg === "https://www.lost112.go.kr/lostnfs/images/sub/img02_no_img.gif"
    ? defaultImage
    : item.fdFilePathImg;

  return (
    <div className="lost-item" onClick={onClick}>
      <img src={imageUrl} alt={item.fdPrdtNm} />
      <div className="lost-item-info">
        <h3>{item.fdPrdtNm}</h3>
        <p>보관 장소: {item.depPlace}</p>
        <p>습득 날짜: {item.fdYmd}</p>
      </div>
    </div>
  );
}
