import React, { useRef, useState } from "react";

import WwcApi from "../../WwcApi";

function ImageUpload({ profile, onProfile }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) {
        console.log("No profile photo selected")
        return
      }
      setLoading(true);
      const pathToUploadedImgUrlObj = await WwcApi.uploadImageToCloudinary(
        file,
        "profile"
      );
      if (!pathToUploadedImgUrlObj || !pathToUploadedImgUrlObj.url) {
        console.log("Profile photo uploaded failed: No url returned")
        return
      }
      onProfile({ ...profile, photo: pathToUploadedImgUrlObj.url });
    } catch (error) {
      console.log("Profile photo uploaded failed: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/*"
      />
      <button className="wwc-primary-button my-3" onClick={handleUploadClick}>
        {loading && (
          <span
            className="spinner-border spinner-border-sm mx-2"
            role="status"
            aria-hidden="true"
          />
        )}
        {loading ? "Uploading" : "Upload"} Image
      </button>
    </div>
  );
}

export default ImageUpload;
