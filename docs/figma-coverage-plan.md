# Figma 커버리지 계획 — 무엇이 세트이고 무엇이 화면인가

Storybook 컴포넌트 180개 중 Figma 에 **세트도 화면도 없는 것 49개**를 전수로 분류한다.
이 문서는 **작업 지시서**다. 다음 배치는 여기서 바로 시작한다(재탐색 금지 — 그게 최대 병목이었다).

산출 근거: `node scripts/verify-parity.mjs` (세트/화면 대조) + `src/templates/AdminSuite/AdminSuite.tsx` 의 사이드바(화면의 단일 출처).

---

## 규칙 — 세트인가 화면인가

| | 정의 | Figma 위치 |
|---|---|---|
| **세트(Component)** | 재사용되는 조각. props 로 변형된다. | `15. System - Admin Component` |
| **화면(Page)** | 사이드바 라우트로 도달하는 완결된 페이지. 세트의 **인스턴스로 조립**한다. | `17. System - Admin Pages` |
| **셸(Shell)** | 화면을 담는 그릇. 그 자체로는 그릴 것이 없다 — **화면이 곧 셸의 렌더 결과**다. | 세트 없음 (사유 등록) |

> **화면은 직접 그리지 마라.** `screens.ts` 상단 주석의 오너 확정 사항이다 —
> 화면은 `15. System - Admin Component` 의 세트를 `inst()` 로 조립한다. 직접 그리면 컴포넌트를 고쳐도 화면이 안 바뀐다.

---

## A. 화면 누락 — 오너의 사이드바 6그룹 기준 (최우선)

`AdminSuite` 사이드바는 오너가 확정한 구조다. 그런데 **6그룹 중 4개 그룹의 화면이 Figma 에 없다.**

| 사이드바 | 라우트 | 컴포넌트 | Figma 화면 |
|---|---|---|---|
| 1. 대시보드 | `dashboard` | `DashboardScreen` | ✅ 대시보드 |
| 2. 회원관리 › 사용자 | `customer-list` | `CustomerList` | ❌ **없음** |
| 2. 회원관리 › 운영자 | `staff-list` | `StaffList` | ✅ 운영진 |
| 3. 상품관리 › 카테고리 | `category-list` | `CategoryList` | ❌ **없음** (오너 시안 있음) |
| 3. 상품관리 › 상품 | `product-screen` | `ProductListScreen` | ⚠️ Figma 는 다른 컴포넌트(`ProductList`)를 그린다 |
| 3. 상품관리 › 주문 | `orders` | `OrderList` | ✅ 주문 목록 |
| 4. 문의관리 | `inquiry-manage` | `InquiryManageList` | ❌ **없음** |
| 5. 회사관리 › 회사소개 | `company-form` | `CompanyForm` | ✅ |
| 5. 회사관리 › 연혁 | `history-list` | `HistoryList` | ✅ |
| 5. 회사관리 › 포트폴리오 | `portfolio-list` | `PortfolioList` | ✅ |
| 6. 메인비주얼 관리 | `mainvisual-list` | `MainVisualList` | ❌ **없음** |

### 신설할 화면 (우선순위 순)

1. **카테고리 관리** — `CategoryList` (오너 시안 有: 드래그핸들·순번·브랜드·카테고리명·설명·하위뱃지·등록일·활성화토글·관리)
2. **카테고리 등록/수정** — `CategoryForm` (오너 시안 有: 브랜드\*·카테고리명\*·카테고리 이미지·설명·활성화)
3. **메인비주얼 관리** — `MainVisualList`
4. **메인비주얼 등록/수정** — `MainVisualForm`
5. **문의관리** — `InquiryManageList`
6. **문의 상세(관리)** — `InquiryManageDetail`
7. **문의 설정** — `InquirySettings`
8. **사용자 목록** — `CustomerList` (기존 '고객 목록'은 `MemberList` 다 — **다른 컴포넌트**다. 이름 충돌 확인 필요)
9. **상품 상세** — `ProductDetail`
10. **상품 등록/수정** — `ProductEditPage`

기타 화면(데모·변형 섹션): `InquiryBoard` · `InquiryApplicationDetail` · `QaList` · `AnswerForm` · `AnswerHistory` · `NoticeBoard`(→ Figma '공지사항' `screenNotice` 로 이미 있음 — 이름 매칭만 안 될 뿐)

---

## B. 세트 누락 — Admin 컴포넌트 (21개)

전부 `15. System - Admin Component` 에 세트로 만든다. **이름은 코드가 정한다**(prop 이름 = Figma 속성 이름).

| 컴포넌트 | 성격 |
|---|---|
| `RowActions` | 행 액션 (수정·삭제 아이콘) — 거의 모든 목록 화면이 쓴다 |
| `ListToolbar` | 목록 툴바 (검색·총건수·액션) — SortBar 를 흡수했다(`layout` 축 有) |
| `ToolbarActions` | 툴바 우측 액션 묶음 |
| `FilterBar` | 필터 바 |
| `FormSection` | 폼 섹션 카드 |
| `FieldRow` | 라벨+컨트롤 행 (`labelPlacement: top \| left`) |
| `FormAnchorNav` | 폼 앵커 내비 |
| `Placeholder` | 빈 그림 (8종 `kind`) |
| `ContextMenu` | 컨텍스트 메뉴 |
| `AdminChart` | 차트 |
| `AnalyticsTable` | 분석 표 |
| `AttachmentList` | 첨부 목록 |
| `CategoryTree` | 카테고리 트리 (2Depth) |
| `ConsentList` | 동의 목록 |
| `GroupPanel` | 그룹 패널 |
| `ImagePreview` | 이미지 미리보기 |
| `MainVisualUploader` | 메인비주얼 업로더 |
| `MobilePreview` | 모바일 미리보기 |
| `OptionRows` | 옵션 행 |
| `RichTextEditor` | 리치 텍스트 에디터 |
| `SortableList` | 정렬 가능한 목록 |

## C. 세트 누락 — 컴포넌트·사이트 (3개, 확정 누락)

| 컴포넌트 | 오너 요구 |
|---|---|
| `InputBase` | **입력 박스 자체를 컴포넌트화.** 오른쪽 아이콘 `trailing` 을 **INSTANCE_SWAP** 으로, 좌측은 `leading`. `size`(sm·md·lg) × `error`·`success`·`disabled`·`readOnly` 축. 라벨 없이 박스만 쓰는 구성이 실재한다. |
| `EraTimeline` | 연혁 표기 — 오너가 "별도 컴포넌트 + 스토리북 변수화" 로 직접 지시한 것인데 Figma 미러링이 빠졌다. |
| `Highlight` | 강조 텍스트 — 같은 사유. |

---

## D. 셸 — 세트가 필요 없다 (사유 등록)

이들은 **화면이 곧 렌더 결과**다. 세트로 만들면 화면과 중복된다.
`verify-parity` 의 `KNOWN_GAPS` 에 사유와 함께 등록한다.

`AdminShell` · `AdminListPage` · `AdminFormPage` · `AdminPageLayout` · `AdminGrid` · `AdminListView` ·
`PageContainer` · `DetailLayout` · `PageHeaderBar` · `AdminSuite` · `SiteSuite`

> 단, `PageHeaderBar` 는 판단이 갈린다 — 화면마다 반복되는 **조각**이면 세트가 맞다.
> 실제 사용처를 grep 해서 결정하고, 결정 근거를 여기 적어라.

---

## 게이트

이 문서의 항목이 하나라도 남아 있으면 `verify-parity` 가 **KNOWN_GAPS 에 사유를 요구**한다.
사유 없는 갭과 **썩은 항목**(이미 해소됐는데 남은 것)은 실패한다.
`verify-naming` 이 세트의 속성 이름을, `verify-screen-props` 가 화면의 `inst()` 오버라이드를 강제한다.

**세트를 만들었으면 그 세트를 부르는 화면도 같은 커밋에서 고쳐라** — 개명은 규약 준수인 동시에 사고다.
