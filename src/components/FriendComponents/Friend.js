import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/FriendCss/Friend.css';

const { kakao } = window;

const Friend = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [displayedFriends, setDisplayedFriends] = useState([]); // 필터링된 친구 목록
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [map, setMap] = useState(null);
  const [centerMarker, setCenterMarker] = useState(null);
  const [infowindow, setInfowindow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState({ latitude: 37.497942, longitude: 127.027621 }); // 기본 위치
  const [circle, setCircle] = useState(null);
  const [markers, setMarkers] = useState([]); // 관리할 마커들
  const [circleRadius, setCircleRadius] = useState(1000); // 원의 반경 (미터)
  const [sentRequests, setSentRequests] = useState([]); // 이미 보낸 친구 요청 목록
  const [activeInfowindows, setActiveInfowindows] = useState([]); // 열린 인포윈도우 관리

  // 로그인 상태 확인
  const checkLoginStatus = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.userId) {
      alert('로그인 하셔야 이용할 수 있는 페이지입니다.');
      navigate('/login');
    }
  };

  // 사용자 위치 가져오기
  const getUserLocation = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.latitude && user.longitude) {
      setUserLocation({ latitude: user.latitude, longitude: user.longitude });
    }
  };

  // 친구 데이터 가져오기
  const fetchFriends = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user')).userId;
      const response = await axios.get('http://localhost:9999/user', {
        params: { userId } // API에 userId를 파라미터로 전달
      });

      // 로그인된 유저와 친구 관계인 유저를 제외
      const filteredFriends = response.data.filter(friend => friend.userId !== userId);
      setFriends(filteredFriends);
    } catch (error) {
      console.error("친구 데이터를 가져오는 중 오류 발생", error);
      setError("친구 데이터를 가져오는 데 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 보낸 친구 요청 목록 가져오기
  const fetchSentRequests = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user')).userId;
      const response = await axios.get('http://localhost:9999/friend/sentRequests', {
        params: { userId }
      });
      setSentRequests(response.data);
    } catch (error) {
      console.error("보낸 친구 요청을 가져오는 중 오류 발생", error);
    }
  };

  // 로그인 상태 확인 및 친구 데이터 가져오기
  useEffect(() => {
    checkLoginStatus();
    getUserLocation();
    fetchFriends();
    fetchSentRequests();
  }, [navigate]);

  // 지도 및 마커 설정
  useEffect(() => {
    if (window.kakao && friends.length > 0 && userLocation) {
      const container = document.getElementById('map');
      if (!container) {
        console.error('Map container not found');
        return;
      }

      const options = {
        center: new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude),
        level: 5
      };

      const mapInstance = new kakao.maps.Map(container, options);
      setMap(mapInstance);

      const infowindowInstance = new kakao.maps.InfoWindow({ zIndex: 1 });
      setInfowindow(infowindowInstance);

      const centerPosition = new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude);
      const centerMarkerInstance = new kakao.maps.Marker({ position: centerPosition });
      centerMarkerInstance.setMap(mapInstance);
      setCenterMarker(centerMarkerInstance);

      kakao.maps.event.addListener(centerMarkerInstance, 'click', () => {
        setSelectedFriend(null);
        infowindowInstance.setContent('<div style="padding:5px;">나</div>');
        infowindowInstance.open(mapInstance, centerMarkerInstance);
      });

      const circleInstance = new kakao.maps.Circle({
        center: centerPosition,
        radius: circleRadius, // 반경 설정
        strokeWeight: 1, // 선 두께
        strokeColor: '#FF0000', // 선 색상
        strokeOpacity: 0.8, // 선 투명도
        strokeStyle: 'solid', // 선 스타일
        fillColor: '#FF0000', // 채우기 색상
        fillOpacity: 0.3 // 채우기 투명도
      });
      circleInstance.setMap(mapInstance);
      setCircle(circleInstance);

      // 원 안에 있는 친구들만 필터링하여 마커 표시 및 목록 업데이트
      filterFriendsWithinCircle(mapInstance, centerPosition, circleRadius);
    }
  }, [friends, userLocation, circleRadius]);

  // 두 위치 간의 거리를 미터 단위로 계산하는 함수
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // 지구의 반지름 (미터 단위)
    const radLat1 = lat1 * Math.PI / 180;
    const radLat2 = lat2 * Math.PI / 180;
    const deltaLat = (lat2 - lat1) * Math.PI / 180;
    const deltaLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(radLat1) * Math.cos(radLat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  };

  // 원 안의 친구 필터링
  const filterFriendsWithinCircle = (mapInstance, centerPosition, radius) => {
    if (centerPosition && radius) {
      // 기존 마커 제거
      markers.forEach(marker => marker.setMap(null));

      // 새로운 마커 리스트 초기화
      const newMarkers = [];
      const filteredFriends = [];

      friends.forEach(friend => {
        const friendLat = friend.latitude;
        const friendLon = friend.longitude;
        const distance = calculateDistance(centerPosition.getLat(), centerPosition.getLng(), friendLat, friendLon);

        if (distance <= radius) {
          filteredFriends.push(friend); // 범위 내 친구들만 저장
          const friendPosition = new kakao.maps.LatLng(friendLat, friendLon);
          const friendMarker = new kakao.maps.Marker({
            position: friendPosition,
            map: mapInstance,
            title: friend.userNick
          });

          // 마커 클릭 시 infowindow 열기
          kakao.maps.event.addListener(friendMarker, 'click', () => {
            setSelectedFriend(friend);
            closeAllInfowindows(); // 모든 infowindow 닫기
            infowindow.setContent(`<div style="padding:5px;">${friend.userNick}</div>`);
            infowindow.open(mapInstance, friendMarker);
            setActiveInfowindows(prev => [...prev, infowindow]); // 상태 업데이트
          });

          newMarkers.push(friendMarker);
        }
      });

      // 상태 업데이트
      setMarkers(newMarkers);
      setDisplayedFriends(filteredFriends); // 범위 내 친구들만 상태에 저장
    }
  };

  // 모든 infowindow 닫기
  const closeAllInfowindows = () => {
    activeInfowindows.forEach(infowindow => infowindow.close());
    setActiveInfowindows([]); // 상태 초기화
  };

  // 내 위치로 이동
  const moveToMyLocation = () => {
    if (map && centerMarker && infowindow) {
      const myPosition = new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude);
      map.panTo(myPosition);
      setSelectedFriend(null);
      infowindow.setContent('<div style="padding:5px;">나</div>');
      infowindow.open(map, centerMarker);
    }
  };

  // 팝업 닫기
  const closePopup = () => {
    setSelectedFriend(null);
    closeAllInfowindows(); // 모든 infowindow 닫기
  };

  // 친구 추가 요청 보내기
  const sendFriendRequest = async (senderId, receiverId) => {
    // 이미 요청을 보낸 친구인지 확인
    const alreadySent = sentRequests.some(request => request.receiverId === receiverId);
    if (alreadySent) {
      alert('이미 친구 요청이 접수된 상태입니다.');
      return;
    }

    try {
      await axios.post('http://localhost:9999/friend/addFriendRequest', null, {
        params: {
          senderId: senderId,
          receiverId: receiverId
        }
      });
      alert('친구 요청이 전송되었습니다.');
      setSentRequests(prevRequests => [...prevRequests, { senderId, receiverId }]); // 새로운 요청을 sentRequests에 추가
    } catch (error) {
      console.error('친구 요청 전송 중 오류 발생', error);
      if (error.response) {
        alert(`서버 오류: ${error.response.data.message || '알 수 없는 오류'}`);
      } else if (error.request) {
        alert('서버에 요청을 보냈으나 응답이 없습니다.');
      } else {
        alert(`요청 설정 오류: ${error.message}`);
      }
    }
  };

  // 친구 추가 클릭 핸들러
  const handleAddFriend = () => {
    if (selectedFriend) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.userId) {
        sendFriendRequest(user.userId, selectedFriend.userId);
      }
    }
  };

  if (loading) {
    return <p>로딩 중...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="container">
      <div className="map-container">
        <h1>주변 친구 찾기</h1>
        <div id="map" className="map">
          <button onClick={moveToMyLocation} className="refresh-button">
            <img src="/images/refresh.png" alt="Refresh" />
          </button>
        </div>
      </div>
      <div className="friend-list">
        <h2 className="friend-list-header">내 주변 추천친구</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {displayedFriends.map((friend) => (
            <li 
              key={friend.userId} 
              id={`friend-${friend.userId}`} 
              className="friend-item"
              onClick={() => {
                const friendPosition = new kakao.maps.LatLng(friend.latitude, friend.longitude);
                map.panTo(friendPosition);
                setSelectedFriend(friend);
                closeAllInfowindows(); // 모든 infowindow 닫기
                const friendMarker = new kakao.maps.Marker({ position: friendPosition });
                infowindow.setContent(`<div style="padding:5px;">${friend.userNick}</div>`);
                infowindow.open(map, friendMarker);
                setActiveInfowindows([infowindow]); // 상태 업데이트
              }}
            >
              <img 
                src={friend.userProImg || '/images/profile.png'} 
                alt="Profile" 
                className="friend-profile-img" 
              />
              <strong>{friend.userId}</strong> - {friend.userNick}
            </li>
          ))}
        </ul>
      </div>
      {selectedFriend && (
        <div className="profile-popup">
          <h1 className="profile-header">
            프로필
            <button onClick={closePopup} style={{ position: 'absolute', right: '10px', top: '0' }}>X</button>
          </h1>
          <div className="profile-picture">
            <img 
              src={selectedFriend.userProImg || '/images/profile.png'} 
              alt="Profile" 
            />
          </div>
          <div>{selectedFriend.userNick}</div>
          <p>{selectedFriend.userAddress}</p>
          <button className="add-friend-button" onClick={handleAddFriend}>친구 추가</button>
        </div>
      )}
    </div>
  );
};

export default Friend;
