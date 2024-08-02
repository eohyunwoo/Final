import React, { useEffect } from 'react';
import '../css/PostcodeComponent.css'; 
//다음 주소 api
const loadDaumPostcodeScript = () => {
  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById('daum-postcode-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.id = 'daum-postcode-script';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    } else {
      resolve();
    }
  });
};

const PostcodeComponent = ({ address, setAddress, extraAddress, setExtraAddress }) => {
  useEffect(() => {
    loadDaumPostcodeScript().catch(err => {
      console.error('Failed to load Daum Postcode script:', err);
    });
  }, []);

  const handlePostcode = () => {
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function (data) {
          let addr = '';
          let extraAddr = '';

          if (data.userSelectedType === 'R') {
            addr = data.roadAddress;
          } else {
            addr = data.jibunAddress;
          }

          if (data.userSelectedType === 'R') {
            if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
              extraAddr += data.bname;
            }
            if (data.buildingName !== '' && data.apartment === 'Y') {
              extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            if (extraAddr !== '') {
              extraAddr = ' (' + extraAddr + ')';
            }
          }

          setAddress(addr);
          setExtraAddress(extraAddr);
        }
      }).open();
    } else {
      console.error('Daum Postcode script is not loaded.');
    }
  };

  return (
    <div className="postcode-container">
      
      <input type="text" id="sample6_address" className="postcode-input address" placeholder="주소" value={address} readOnly />
      <input type="text" id="sample6_extraAddress" className="postcode-input extra-address" placeholder="참고항목" value={extraAddress} readOnly />
      <input type="button" className="postcode-button" onClick={handlePostcode} value="주소 찾기" />
    </div>
  );
};

export default PostcodeComponent;