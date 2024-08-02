import React, { useState, useEffect } from 'react';
import LostItem from './LostItem';
import LostDetail from './LostDetail';
import axios from 'axios';
import './LostCss/Lost.css';
import './LostCss/LostItem.css';

const API_KEY = 'Q+p0JOmUQDmC+d024UnPFFYc0mhdzVqbj1NNFsBhTH7FG5PVXidX+7bgWVYd2YMLEZ2ZGNHPvkWZXT76tx3/mw==';
const API_ENDPOINT = 'http://apis.data.go.kr/1320000/LosfundInfoInqireService';
const loadingImage = "/images/lost/Loading.avif"; // 공용 경로에서의 로딩 이미지 경로 설정

export default function Lost() {
  const [lostItems, setLostItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8; // 페이지 당 항목 수

  useEffect(() => {
    fetchInitialItems();
  }, []);

  const fetchInitialItems = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINT}/getLosfundInfoAccToClAreaPd`, {
        params: {
          serviceKey: API_KEY,
          pageNo: 1,
          numOfRows: 100,
          PRDT_CL_CD_01: '',
          PRDT_CL_CD_02: '',
          FD_COL_CD: '',
          N_FD_LCT_CD: '',
        },
        withCredentials: false // withCredentials를 false로 설정하여 CORS 에러 방지
      });
      const items = response.data.response.body.items.item;
      console.log('Fetched items:', items); // 데이터 로깅
      setLostItems(Array.isArray(items) ? items : [items]);
      setFilteredItems(Array.isArray(items) ? items : [items]); // 초기 목록을 필터링된 항목으로 설정
    } catch (error) {
      console.error("Error fetching lost items data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    const results = lostItems.filter(item =>
      item.fdPrdtNm.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(results);
    setCurrentPage(1); // 검색할 때 페이지를 1로 초기화
    setLoading(false);
  };

  const handleItemClick = async (atcId, fdSn) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_ENDPOINT}/getLosfundDetailInfo`, {
        params: {
          serviceKey: API_KEY,
          ATC_ID: atcId,
          FD_SN: fdSn
        },
        withCredentials: false // withCredentials를 false로 설정하여 CORS 에러 방지
      });
      setSelectedItem(response.data.response.body.item);
    } catch (error) {
      console.error("Error fetching lost item detail", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 현재 페이지에 해당하는 항목들만 가져오기
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // 페이지 번호 생성
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredItems.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="lost-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="분실물을 입력하세요."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button type="button" className="search-button" onClick={handleSearch}>
          검색
        </button>
      </div>
      {loading ? (
        <div className="loading">
          <img src={loadingImage} alt="Loading..." />
          <p>데이터 로딩 중, 잠시만 기다려주세요!</p>
        </div>
      ) : (
        <>
          <div className="list-container">
            <div className="lost-items">
              {currentItems.map((item, index) => (
                <LostItem key={index} item={item} onClick={() => handleItemClick(item.atcId, item.fdSn)} className="lost"/>
              ))}
            </div>
            {selectedItem && <LostDetail item={selectedItem} className="detail"/>}
          </div>
          <div className="pagination">
            {pageNumbers.map(number => (
              <button key={number} onClick={() => handlePageChange(number)} className={currentPage === number ? 'active' : ''}>
                {number}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
