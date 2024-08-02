import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MessagePopup from './MessagePopup';
import '../../css/FriendManageCss/FriendManage.css';

const FriendManage = ({ onClose }) => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // 전체 유저 목록
  const [friendStatuses, setFriendStatuses] = useState([]); // 친구 상태
  const [loading, setLoading] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedFriendName, setSelectedFriendName] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user.userId;

        // 전체 유저 목록 가져오기
        const usersResponse = await axios.get('http://localhost:9999/user');
        setAllUsers(usersResponse.data);

        // 친구 요청 가져오기
        const requestsResponse = await axios.get('http://localhost:9999/friend/requests', {
          params: { userId }
        });

        // 현재 사용자가 보낸 요청을 제외한 요청만 필터링
        const filteredRequests = requestsResponse.data.filter(request => request.receiverId === userId);
        setFriendRequests(filteredRequests);

        // 친구 목록 가져오기
        const friendsResponse = await axios.get('http://localhost:9999/friend/friends', {
          params: { userId }
        });
        setFriends(friendsResponse.data);

        // 친구 상태 가져오기
        const statusesResponse = await axios.get('http://localhost:9999/friend/status', {
          params: { userId }
        });
        setFriendStatuses(statusesResponse.data);

      } catch (error) {
        console.error("친구 데이터를 가져오는 중 오류 발생", error);
        alert('친구 데이터를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 유저 ID로 유저 정보 찾기
  const findUserById = (userId) => {
    return allUsers.find(user => user.userId === userId) || {};
  };

  // 유저 ID로 친구 상태 찾기
  const findFriendStatusById = (userId) => {
    const status = friendStatuses.find(status => status.userId === userId);
    return status ? status.status : 'OFFLINE';
  };

  // 상태에 따라 점 색상 결정
  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE':
        return 'green';
      case 'AWAY':
        return 'orange';
      case 'OFFLINE':
        return 'red';
      default:
        return 'gray';
    }
  };

  // 상태에 따라 상태 텍스트 결정
  const getStatusText = (status) => {
    switch (status) {
      case 'ONLINE':
        return '온라인';
      case 'AWAY':
        return '자리비움';
      case 'OFFLINE':
        return '오프라인';
      default:
        return '알 수 없음';
    }
  };

  // 친구 요청 수락
  const acceptFriendRequest = async (requesterId) => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user.userId;

      // 친구 요청 수락 API 호출
      await axios.post('http://localhost:9999/friend/acceptFriendRequest', null, {
        params: { userId, requesterId }
      });

      // 새로운 친구를 상태에 추가
      const newFriend = {
        userId1: userId,
        userId2: requesterId,
        friendshipDate: new Date().toISOString()  // 친구가 된 날짜를 현재 날짜로 설정
      };

      setFriends(prevFriends => [...prevFriends, newFriend]);

      // 요청 목록에서 수락한 요청 제거
      setFriendRequests(prevRequests => prevRequests.filter(request => request.senderId !== requesterId));

      alert('친구 요청을 수락했습니다.');
    } catch (error) {
      console.error("친구 요청 수락 중 오류 발생", error);
      alert('친구 요청을 수락하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 친구 요청 거절
  const declineFriendRequest = async (requesterId) => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user.userId;
      await axios.post('http://localhost:9999/friend/declineFriendRequest', null, {
        params: { userId, requesterId }
      });
      alert('친구 요청을 거절했습니다.');
      setFriendRequests(friendRequests.filter(request => request.senderId !== requesterId));
    } catch (error) {
      console.error("친구 요청 거절 중 오류 발생", error);
      alert('친구 요청을 거절하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 친구 삭제
  const deleteFriend = async (friendId) => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user.userId;
      await axios.post('http://localhost:9999/friend/removeFriend', null, {
        params: { userId, friendId }
      });
      alert('친구를 삭제했습니다.');
      setFriends(friends.filter(friend => friend.userId1 !== friendId && friend.userId2 !== friendId));
    } catch (error) {
      console.error("친구 삭제 중 오류 발생", error);
      alert('친구 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (friendId) => {
    const friend = findUserById(friendId);
    setSelectedFriend(friendId);
    setSelectedFriendName(friend.userNick || '알 수 없는 사용자');
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedFriend(null);
    setSelectedFriendName('');
  };

  return (
    <div className="friend-manage-container">
      <h1 className="friend-manage-title">친구 관리</h1>
      {loading && <p className="friend-manage-loading">로딩 중...</p>}
      
      {/* 친구 목록 섹션 */}
      <div className="friend-manage-friends">
        <h2 className="friend-manage-friends-title">친구 목록</h2>
        {friends.length > 0 ? (
          <ul className="friend-manage-friends-list">
            {friends.map(friend => {
              const friendId = friend.userId1 === JSON.parse(localStorage.getItem('user')).userId ? friend.userId2 : friend.userId1;
              const user = findUserById(friendId);
              const status = findFriendStatusById(friendId);
              return (
                <li key={friendId} className="friend-manage-friend-item">
                  <div className="friend-manage-friend-details">
                    <img src={user.userProImg || '/images/profile.png'} alt="프로필 이미지" className="friend-manage-profile-img" />
                    <p className="friend-manage-nickname">{user.userNick || '알 수 없는 사용자'}</p>
                    <p className="friend-manage-friend-since">친구 시작일: {new Date(friend.friendshipDate).toLocaleDateString()}</p>
                    <div
                      className="friend-manage-status"
                      style={{ backgroundColor: getStatusColor(status) }}
                      data-status={getStatusText(status)} // 상태 텍스트 설정
                    ></div> {/* 상태 점 */}
                    <button className="friend-manage-message-btn" onClick={() => handleSendMessage(friendId)}>메시지 보내기</button>
                    <button className="friend-manage-delete-btn" onClick={() => deleteFriend(friendId)}>친구 삭제</button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="friend-manage-no-friends">친구가 없습니다.</p>
        )}
      </div>
      
      {/* 친구 요청 섹션 */}
      <div className="friend-manage-requests">
        <h2 className="friend-manage-requests-title">친구 요청</h2>
        {friendRequests.length > 0 ? (
          <ul className="friend-manage-requests-list">
            {friendRequests.map(request => {
              const user = findUserById(request.senderId);
              return (
                <li key={request.requestId} className="friend-manage-request-item">
                  <div className="friend-manage-request-details">
                    <img src={user.userProImg || '/images/profile.png'} alt="프로필 이미지" className="friend-manage-profile-img" />
                    <p className="friend-manage-nickname">{user.userNick || '알 수 없는 사용자'}</p>
                    <button className="friend-manage-accept-btn" onClick={() => acceptFriendRequest(request.senderId)}>수락</button>
                    <button className="friend-manage-decline-btn" onClick={() => declineFriendRequest(request.senderId)}>거절</button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="friend-manage-no-requests">친구 요청이 없습니다.</p>
        )}
      </div>
      
      <button className="friend-manage-close-btn" onClick={onClose}>닫기</button>

      {showPopup && <MessagePopup friendId={selectedFriend} friendName={selectedFriendName} onClose={handleClosePopup} />}
    </div>
  );
};

export default FriendManage;
