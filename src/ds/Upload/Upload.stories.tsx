import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { Upload, type UploadProps } from './Upload'

// 컨트롤드 컴포넌트용 데모
function UploadDemo(props: UploadProps) {
  const [files, setFiles] = useState<File[]>(props.files)
  return <Upload {...props} files={files} onChange={setFiles} />
}

// 목록 미리보기용 샘플 파일 (크기만 의미 있게 합성)
const sampleFiles = [
  new File([new Blob(['x'.repeat(215040)])], '용역_계약서_최종.pdf', { type: 'application/pdf' }),
  new File([new Blob(['x'.repeat(18432)])], '견적서.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }),
]

// 격자 미리보기용 합성 이미지 파일 — 썸네일은 빈 사각형으로 렌더됨
const sampleImages = [
  new File([new Blob(['x'])], 'product-01.png', { type: 'image/png' }),
  new File([new Blob(['x'])], 'product-02.png', { type: 'image/png' }),
  new File([new Blob(['x'])], 'product-03.png', { type: 'image/png' }),
]

const meta = {
  title: '3. 컴포넌트/Input/Upload',
  component: Upload,
  tags: ['autodocs'],
  args: {
    label: '첨부 파일',
    files: [],
    multiple: true,
    disabled: false,
    helperText: 'PDF, DOCX 파일 · 최대 10MB',
  },
  argTypes: {
    onChange: { control: false },
    files: { control: false },
    children: { control: false },
    preview: { control: 'inline-radio', options: ['none', 'list', 'grid'] },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Upload>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <UploadDemo {...args} />,
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Upload files={[]} />
      <Upload label="첨부 파일" files={[]} helperText="PDF, DOCX 파일 · 최대 10MB" />
      <Upload label="비활성" files={[]} helperText="지금은 업로드할 수 없어요" disabled />
      <Upload label="커스텀 안내 영역" files={[]}>
        <span style={{ fontSize: 13 }}>여기에 명세서를 끌어다 놓아 주세요</span>
      </Upload>
    </div>
  ),
}

/** 구 FileUpload 프리셋 — 고른 파일을 파일명·용량·삭제 버튼이 있는 목록으로 보여준다 */
export const FileList: Story = {
  args: {
    label: '첨부 파일',
    preview: 'list',
    maxFiles: 5,
    files: sampleFiles,
    helperText: '최대 5개까지 업로드할 수 있어요',
  },
  render: (args) => <UploadDemo {...args} />,
}

/** 구 FileUpload States — 비어 있음 / 파일 있음 / 비활성 */
export const FileListStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Upload
        label="비어 있음"
        preview="list"
        files={[]}
        maxFiles={5}
        helperText="최대 5개까지 업로드할 수 있어요"
      />
      <Upload
        label="파일 있음"
        preview="list"
        files={sampleFiles}
        maxFiles={5}
        helperText="최대 5개까지 업로드할 수 있어요"
      />
      <Upload label="비활성" preview="list" files={sampleFiles} maxFiles={5} disabled />
    </div>
  ),
}

/** 구 ImageUpload 프리셋 — 이미지 전용 accept + 썸네일 격자 + '+' 추가 타일 */
export const ImageGrid: Story = {
  args: {
    label: '상품 이미지',
    accept: 'image/*',
    multiple: true,
    preview: 'grid',
    maxFiles: 6,
    files: sampleImages.slice(0, 2),
    helperText: 'JPG, PNG · 최대 6장',
  },
  render: (args) => <UploadDemo {...args} />,
}

/** 구 ImageUpload States — '+' 타일 노출/숨김과 비활성 */
export const ImageGridStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Upload
        label="비어 있음"
        accept="image/*"
        multiple
        preview="grid"
        files={[]}
        maxFiles={6}
        helperText="JPG, PNG · 최대 6장"
      />
      <Upload
        label="이미지 있음 (+ 타일 노출)"
        accept="image/*"
        multiple
        preview="grid"
        files={sampleImages.slice(0, 2)}
        maxFiles={6}
      />
      <Upload
        label="최대 장수 도달 (+ 타일 숨김)"
        accept="image/*"
        multiple
        preview="grid"
        files={sampleImages}
        maxFiles={3}
      />
      <Upload
        label="비활성"
        accept="image/*"
        multiple
        preview="grid"
        files={sampleImages.slice(0, 2)}
        maxFiles={6}
        disabled
      />
    </div>
  ),
}
