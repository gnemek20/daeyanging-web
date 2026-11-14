"use client";

import { useState } from "react";

// 서버로 보내는 기능이 없으므로, 적은 내용을 담아 방문자의 메일 앱을 연다.
const ContactForm = ({ email }: { email: string }) => {
  const [opened, setOpened] = useState(false);

  const submit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    const name = String(f.get("name") || "");
    const body = [
      `성함 / 회사명: ${name}`,
      `이메일: ${f.get("email") || ""}`,
      "",
      String(f.get("message") || ""),
    ].join("\n");
    const subject = `[홈페이지 문의] ${name}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <form className="form" onSubmit={submit}>
      <div className="form__row">
        <label>
          <span>성함 / 회사명</span>
          <input
            name="name"
            type="text"
            placeholder="홍길동 / (주)○○"
            autoComplete="name"
            required
          />
        </label>
        <label>
          <span>이메일</span>
          <input
            name="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
          />
        </label>
      </div>
      <label>
        <span>문의 내용</span>
        <textarea
          name="message"
          rows={5}
          placeholder="필요하신 지퍼 종류, 수량, 일정 등을 적어주세요."
          required
        />
      </label>
      <button className="btn btn--light" type="submit">
        메일로 문의 보내기
      </button>
      <p className="form__note" role="status">
        {opened ? (
          <>
            <span className="ph">메일 앱이 열렸습니다.</span>{" "}
            <span className="ph">메일 앱에서 보내기를 눌러야</span>{" "}
            <span className="ph">문의가 전달됩니다.</span>
          </>
        ) : (
          <>
            <span className="ph">보내기를 누르면</span>{" "}
            <span className="ph">작성한 내용이 담긴</span>{" "}
            <span className="ph">메일 앱이 열립니다.</span>
          </>
        )}
      </p>
    </form>
  );
};

export default ContactForm;
