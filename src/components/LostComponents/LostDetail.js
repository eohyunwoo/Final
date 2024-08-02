import React from 'react';
import './LostCss/LostDetail.css';

const defaultImage = process.env.PUBLIC_URL + '/images/lost/Lost2.png';

export default function LostDetail({ item }) {
  const imageUrl = item.fdFilePathImg === "https://www.lost112.go.kr/lostnfs/images/sub/img04_no_img.gif" || !item.fdFilePathImg
    ? defaultImage
    : item.fdFilePathImg;

  return (
    <div className="lost-detail">
      <h2>분실물 상세 정보</h2>
      <img src={imageUrl} alt="습득물 사진" className="lost-detail-image" />
      <table className="lost-detail-table">
        <tbody>
          <tr>
            <th>보관 상태 명</th>
            <td>{item.csteSteNm}</td>
          </tr>
          <tr>
            <th>보관 장소</th>
            <td>{item.depPlace}</td>
          </tr>
          <tr>
            <th>습득 시간</th>
            <td>{item.fdHor}</td>
          </tr>
          <tr>
            <th>습득 장소</th>
            <td>{item.fdPlace}</td>
          </tr>
          <tr>
            <th>물품명</th>
            <td>{item.fdPrdtNm}</td>
          </tr>
          <tr>
            <th>습득 일자</th>
            <td>{item.fdYmd}</td>
          </tr>
          <tr>
            <th>보관 기관</th>
            <td>{item.fndKeepOrgnSeNm}</td>
          </tr>
          <tr>
            <th>기관명</th>
            <td>{item.orgNm}</td>
          </tr>
          <tr>
            <th>물품 분류명</th>
            <td>{item.prdtClNm}</td>
          </tr>
          <tr>
            <th>전화번호</th>
            <td>{item.tel}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
