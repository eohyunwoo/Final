import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/UserCss/MyPage.css';
import { useAuth } from '../../contexts/AuthContext';
import PostcodeComponent from '../../contexts/PostcodeComponent';

export default function MyPage() {
  const { user } = useAuth();
  const [nickName, setNickName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [address, setAddress] = useState('');
  const [extraAddress, setExtraAddress] = useState('');
  const [friends, setFriends] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setNickName(user.userNick);
      setAddress(user.userAddress);

      // 친구 목록 가져오기 - 주석 처리하여 테스트할 수 있도록 함
      /*
      axios.get(`http://localhost:9999/friends?userId=${user.userId}`)
        .then(response => {
          setFriends(response.data);
        })
        .catch(error => {
          console.error('Error fetching friends:', error);
        });
      */
    }
  }, [user]);

  const handleUpdate = () => {
    setError(''); // 기존 오류 메시지 초기화

    if (!currentPassword) {
      setError('현재 비밀번호를 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('nickName', nickName);
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    formData.append('address', address);
    formData.append('extraAddress', extraAddress);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    axios.post('http://localhost:9999/updateProfile', formData, {
      // withCredentials: true, // 세션 유지를 위해 추가
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        alert('변경 완료');
        
      })
      .catch(error => {
        if (error.response && error.response.status === 401) {
          setError('비밀번호를 다시 확인해주세요.');
        } else {
          console.error('Error updating profile:', error);
        }
      });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="mypage-container">
      <h1 className="hash-title">#</h1> <h1>마이페이지</h1>
      <div className="user-info">
        <div className="user-id">아이디 : {user?.userId}</div>
        <div className="user-profile">
          <div
            className="profile-pic-container"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {profileImage ? (
              <img src={URL.createObjectURL(profileImage)} alt="User Profile" className="profile-pic" />
            ) : user?.userProImg ? (
              <img src={user.userProImg} alt="User Profile" className="profile-pic" />
            ) : (
              <div className="profile-pic-placeholder">프로필 이미지 없음</div>
            )}
          </div>
        </div>
        <div className="input-group">
          <label>* 현재 비밀번호</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="기존의 비밀번호를 입력해주세요" />
          {error && <div className="error-message">{error}</div>}
        </div>
        <div className="input-group">
          <label>* 변경할 비밀번호</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="변경할 비밀번호를 입력해주세요" />
        </div>
        <div className="input-group">
          <label>* 닉네임 변경</label>
          <input type="text" value={nickName} onChange={(e) => setNickName(e.target.value)} />
        </div>
        
        <div className="input-group">
          <label>* 주소 변경</label>
          <PostcodeComponent
            address={address}
            setAddress={setAddress}
            extraAddress={extraAddress}
            setExtraAddress={setExtraAddress}
          />
        </div>
        <button onClick={handleUpdate} className="btn-update">변경 완료</button>
      </div>
      
      <div className="separator">
        <span className="separator-text">친구 삭제 기능</span>
      </div>
      
      {/* 친구 관리 기능 - 주석 처리하여 테스트할 수 있도록 함 */}
      {/*
      <div className="friend-management">
        <h1 className="hash-title">#</h1> <h1>친구 관리</h1>
        {friends.length > 0 ? (
          friends.map(friend => (
            <div className="friend" key={friend.id}>
              <div className="friend-pic"></div>
              <div className="friend-name">{friend.name}</div>
              <button className="btn-delete-friend">친구 삭제</button>
            </div>
          ))
        ) : (
          <p>친구가 없습니다.</p>
        )}
      </div>
      */}
    </div>
  );
}