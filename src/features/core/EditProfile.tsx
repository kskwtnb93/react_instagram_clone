import React, { useState } from "react";
import Modal from "react-modal";
import styles from "./Core.module.css";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { File } from "../types";

import {
  editNickName,
  selectProfile,
  selectOpenProfile,
  resetOpenProfile,
  fetchCredStart,
  fetchCredEnd,
  fetchAsyncUpdateProfile,
} from "../auth/authSlice";

import { Button, TextField, IconButton } from "@material-ui/core";
import { MdAddAPhoto } from "react-icons/md";

const customStyles = {
  content: {
    top: "55%",
    left: "50%",
    width: 280,
    height: 220,
    padding: "50px",
    transform: "translate(-50%, -50%)",
  },
};

function EditProfile() {
  const dispatch: AppDispatch = useDispatch();
  // モーダルの state を redux store から参照
  const openProfile = useSelector(selectOpenProfile);
  // ログインしているユーザーのプロフィール情報を redux store から参照
  const profile = useSelector(selectProfile);
  // ユーザーのプロフィール画像
  const [image, setImage] = useState<File | null>(null);

  // プロフィール更新
  const updateProfile = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    const packet = {
      id: profile.id,
      nickName: profile.nickName,
      img: image,
    };

    await dispatch(fetchCredStart());
    await dispatch(fetchAsyncUpdateProfile(packet));
    await dispatch(fetchCredEnd());
    // モーダルを閉じる
    await dispatch(resetOpenProfile());
  };

  const handleEditPicture = () => {
    const fileInput = document.getElementById("imageInput");
    fileInput?.click();
  };

  return (
    <>
      <Modal
        isOpen={openProfile}
        onRequestClose={async () => {
          await dispatch(resetOpenProfile());
        }}
        style={customStyles}
      >
        <form className={styles.core_signUp}>
          <h1 className={styles.core_title}>Instagram clone</h1>

          <br />

          <TextField
            placeholder="ニックネーム"
            type="text"
            value={profile?.nickName}
            onChange={(e) => dispatch(editNickName(e.target.value))}
          />

          <input
            hidden={true}
            type="file"
            id="imageInput"
            onChange={(e) => setImage(e.target.files![0])}
          />

          <br />

          <IconButton onClick={handleEditPicture}>
            <MdAddAPhoto />
          </IconButton>

          <br />

          <Button
            disabled={!profile?.nickName}
            variant="contained"
            color="primary"
            type="submit"
            onClick={updateProfile}
          >
            更新
          </Button>
        </form>
      </Modal>
    </>
  );
}

export default EditProfile;
