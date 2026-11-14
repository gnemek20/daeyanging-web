import TapePicker from "./TapePicker";
import ZipperStrip from "./ZipperStrip";

// 서버 컴포넌트 — 자바스크립트 없이 동작한다.
// 컬러와 마감은 기본 라디오 버튼이고, 선택에 따라 미리보기 색과 안내 문구를 CSS(:has)가 바꾼다.
// 컬러 줄 맨 끝의 "직접 고르기"만 색상 선택기 값을 읽어야 해서 작은 클라이언트 컴포넌트(TapePicker)다.

const COLORS = [
  { key: "indigo", name: "인디고", hex: "#26367A" },
  { key: "cobalt", name: "코발트", hex: "#1F6FD1" },
  { key: "red", name: "레드", hex: "#C8202F" },
  { key: "tangerine", name: "탠저린", hex: "#E0662F" },
  { key: "mustard", name: "머스터드", hex: "#E2AE2A" },
  { key: "emerald", name: "에메랄드", hex: "#0F7A5C" },
  { key: "rose", name: "로즈", hex: "#E9A6B4" },
  { key: "ivory", name: "아이보리", hex: "#E6DECB" },
  { key: "black", name: "블랙", hex: "#17181C" },
];

// 직접 고르기를 처음 눌렀을 때의 색(팔레트에 없는 바이올렛)
const PICK_DEFAULT = "#7B4FD6";

const FINISHES = [
  {
    key: "metal",
    label: "메탈",
    stops: ["#F6E2A8", "#D4AE5E", "#A07A2E", "#6E4F18"],
  },
  {
    key: "matte",
    label: "무광",
    stops: ["#7A7D83", "#5C5F65", "#46494E", "#323438"],
  },
  {
    key: "gloss",
    label: "유광",
    stops: ["#B9BCC2", "#3A3C41", "#141518", "#000000"],
  },
];

// 선택 상태 → CSS 변수 / 안내 문구 표시 규칙
const RULES = [
  ...COLORS.map(
    (c) =>
      `.custom:has(input[name="tape"][value="${c.key}"]:checked){--cfg-tape:${c.hex}}` +
      `.custom:has(input[name="tape"][value="${c.key}"]:checked) [data-tag-color="${c.key}"]{display:inline}`,
  ),
  `.custom:has(input[name="tape"][value="custom"]:checked){--cfg-tape:var(--cfg-pick,${PICK_DEFAULT})}` +
    `.custom:has(input[name="tape"][value="custom"]:checked) [data-tag-color="custom"]{display:inline}`,
  ...FINISHES.map(
    (f) =>
      `.custom:has(input[name="finish"][value="${f.key}"]:checked){${f.stops.map((s, i) => `--cfg-s${i}:${s}`).join(";")}}` +
      `.custom:has(input[name="finish"][value="${f.key}"]:checked) [data-tag-finish="${f.key}"]{display:inline}`,
  ),
].join("");

const Custom = () => {
  return (
    <section className="sec sec--soft" id="custom" aria-labelledby="custom-h">
      <style>{RULES}</style>
      <div className="wrap custom">
        <div className="custom__preview">
          <ZipperStrip
            id="cfg"
            kind="metal"
            tape="var(--cfg-tape)"
            stops={[
              "var(--cfg-s0)",
              "var(--cfg-s1)",
              "var(--cfg-s2)",
              "var(--cfg-s3)",
            ]}
            title="선택한 컬러와 마감으로 그린 지퍼 미리보기"
            bleed
          />
          <p className="custom__tag" aria-hidden="true">
            {COLORS.map((c) => (
              <span key={c.key} data-tag-color={c.key}>
                {c.name}
              </span>
            ))}
            <span data-tag-color="custom">
              직접 고른 컬러(<span data-tag-hex>{PICK_DEFAULT}</span>)
            </span>{" "}
            테이프,{" "}
            {FINISHES.map((f) => (
              <span key={f.key} data-tag-finish={f.key}>
                {f.label}
              </span>
            ))}{" "}
            마감
          </p>
        </div>

        <div className="config">
          <h2 className="h2" id="custom-h">
            생각하는 모양
            <br />
            그대로.
          </h2>
          <p className="body">
            <span className="ph">정해진 규격에 맞추지 않습니다.</span>{" "}
            <span className="ph">사이즈, 컬러, 마감까지,</span>{" "}
            <span className="ph">1:1 맞춤 제작으로</span>{" "}
            <span className="ph">원하는 지퍼를 자유롭게 구현합니다.</span>
          </p>

          <div className="config__rows">
            <div className="config__row">
              <span className="config__k">길이</span>
              <span className="config__v">맞춤 재단</span>
            </div>
            <div className="config__row">
              <span className="config__k" id="cfg-color-k">
                컬러
              </span>
              <div
                className="config__v swatches"
                role="radiogroup"
                aria-labelledby="cfg-color-k"
              >
                {COLORS.map((c, i) => (
                  <label
                    key={c.key}
                    className="swatch"
                    style={{ background: c.hex }}
                    title={c.name}
                  >
                    <input
                      type="radio"
                      name="tape"
                      value={c.key}
                      defaultChecked={i === 0}
                    />
                    <span className="sr-only">{c.name}</span>
                  </label>
                ))}
                <TapePicker initial={PICK_DEFAULT} />
              </div>
            </div>
            <div className="config__row">
              <span className="config__k" id="cfg-finish-k">
                마감
              </span>
              <div
                className="config__v seg"
                role="radiogroup"
                aria-labelledby="cfg-finish-k"
              >
                {FINISHES.map((f, i) => (
                  <label key={f.key} className="seg__btn">
                    <input
                      type="radio"
                      name="finish"
                      value={f.key}
                      defaultChecked={i === 0}
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="config__row">
              <span className="config__k">슬라이더</span>
              <span className="config__v">형태 선택</span>
            </div>
            <div className="config__row">
              <span className="config__k">수량</span>
              <span className="config__v">샘플부터 양산까지</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Custom;
