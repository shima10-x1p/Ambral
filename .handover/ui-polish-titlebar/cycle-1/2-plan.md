# 実装計画: UI改善 — カスタムタイトルバー・余白縮小・シャドウ削除

## 実装方針
変更は CSS の修正が中心で、TS ファイルの変更は最小限（main の BrowserWindow 設定と、renderer のドラッグ領域用 CSS 適用）に留める。
変更ファイル数は 9 ファイルで収まるため、Phase 1 のみの単一フェーズで実装する。
すべての変更はアプリの基本機能（チャット送受信、スクロール、モデル選択）に影響を与えない範囲で行う。

## 実装フェーズ

### Phase 1: カスタムタイトルバー導入 + 余白圧縮 + シャドウ削除

- 概要: Electron の titleBarOverlay API でタイトルバーを一体化し、メニューバーを非表示化。同時に全コンポーネントの縦余白圧縮と box-shadow 削除を行う。
- タスク:

  - [ ] Task-1-1: BrowserWindow にカスタムタイトルバー設定を追加
    - 説明: `titleBarStyle: 'hidden'` と `titleBarOverlay` オプションを BrowserWindow の設定に追加。`autoHideMenuBar: true` でメニューバーを非表示にする。titleBarOverlay の色はダークテーマに合わせる。
    - ファイル: `src/main/index.ts`
    - 方針:
      ```ts
      const mainWindow = new BrowserWindow({
        // ...既存設定
        titleBarStyle: "hidden",
        titleBarOverlay: {
          color: "#171717",        // サイドバー背景色と同色
          symbolColor: "#ececec",  // テキスト色と同色
          height: 36,
        },
        autoHideMenuBar: true,
      });
      ```
      - `titleBarOverlay.height: 36` は VSCode の標準的なタイトルバー高さに合わせた値
      - `color` はサイドバー背景色 `--color-sidebar-bg: #171717` に合わせてシームレスに見せる

  - [ ] Task-1-2: renderer にドラッグ領域を追加
    - 説明: アプリ全体の上端にドラッグ可能な領域を設け、ウィンドウの移動を可能にする。サイドバーと ChatArea の上部がそのままドラッグ領域になる形にする。
    - ファイル: `src/renderer/App.module.css`, `src/renderer/App.tsx`
    - 方針:
      - `App.module.css` に `.titleBar` クラスを追加。`-webkit-app-region: drag` で全幅のドラッグ領域を実現。高さは `titleBarOverlay.height` と一致させて 36px。
      - `App.tsx` のレイアウトで、`.app` の上に薄いドラッグ用 div を CSS Grid で配置するか、もしくはサイドバーと ChatArea の上部 padding で titleBarOverlay の高さ分を確保する。
      - **推奨アプローチ**: サイドバーと ChatArea それぞれの上部に `padding-top: 36px` を付与し、その領域に `-webkit-app-region: drag` を設定する。これにより App.tsx への要素追加が不要になる。ただし、サイドバー上部とChatArea 上部で別の背景色になるため、個別に対応する必要がある。
      - **よりシンプルなアプローチ**: `App.module.css` の `.app` に `padding-top: 36px` と `-webkit-app-region: drag` を適用し、子要素（サイドバー、ChatArea）には `-webkit-app-region: no-drag` を設定する。これが最もシンプル。
      - ボタンやリンクなど対話要素は `-webkit-app-region: no-drag` が必要（CSS Modules 内で子要素のインタラクティブ要素に設定）。ただし Electron のデフォルト挙動で `<button>`, `<input>`, `<textarea>`, `<select>` 等のインタラクティブ要素はドラッグから自動除外されるため、個別設定は不要。
      - `min-height: 100vh` を `height: 100vh` に変更し、タイトルバー込みでビューポートに収める。

  - [ ] Task-1-3: Sidebar の余白圧縮・シャドウ削除
    - 説明: サイドバー内の各要素間 gap、padding、新規チャットボタン、履歴カードの box-shadow を調整する。
    - ファイル: `src/renderer/components/Sidebar/Sidebar.module.css`
    - 方針:
      | プロパティ | 変更前 | 変更後 | 理由 |
      |-----------|--------|--------|------|
      | `.sidebar` gap | 24px | 16px | 要素間の縦余白を縮小 |
      | `.sidebar` padding | 22px 18px 20px | 12px 14px 14px | 上部は titleBar 分のスペースを確保済みなので縮小 |
      | `.sidebar` box-shadow | `inset -1px 0 0 ...` | 削除 | 全シャドウ削除 |
      | `.title` margin-top | 10px | 6px | 縦余白縮小 |
      | `.description` margin-top | 12px | 8px | 縦余白縮小 |
      | `.newChatButton` padding | 13px 16px | 10px 14px | 縦余白縮小 |
      | `.newChatButton` border-radius | 18px | 14px | コンパクトに合わせる |
      | `.newChatButton:hover` box-shadow | `0 12px 24px ...` | 削除 | 全シャドウ削除 |
      | `.placeholder` padding | 18px | 12px 14px | 縦余白縮小 |
      | `.placeholder` border-radius | 20px | 14px | コンパクトに合わせる |
      | `.placeholder` box-shadow | `0 10px 24px ...` | 削除 | 全シャドウ削除 |
      | `.placeholderText` margin-top | 10px | 6px | 縦余白縮小 |

  - [ ] Task-1-4: ChatArea ヘッダーの余白圧縮
    - 説明: ChatArea ヘッダーの上余白を縮小する。
    - ファイル: `src/renderer/components/ChatArea/ChatArea.module.css`
    - 方針:
      | プロパティ | 変更前 | 変更後 | 理由 |
      |-----------|--------|--------|------|
      | `.header` padding | 28px 40px 6px | 14px 40px 4px | ヘッダー上余白を大幅縮小 |
      | `.title` margin-top | 6px | 4px | 微調整 |
      | `.kicker` font-size | 0.85rem | 0.8rem | よりコンパクトに |

  - [ ] Task-1-5: MessageList の余白圧縮
    - 説明: メッセージ間の gap とリスト自体のパディングを縮小する。
    - ファイル: `src/renderer/components/MessageList/MessageList.module.css`
    - 方針:
      | プロパティ | 変更前 | 変更後 | 理由 |
      |-----------|--------|--------|------|
      | `.list` gap | 20px | 12px | メッセージ間の縦余白を縮小 |
      | `.list` padding | 24px 0 28px | 16px 0 20px | リスト上下の余白縮小 |

  - [ ] Task-1-6: MessageItem の余白圧縮・シャドウ削除
    - 説明: メッセージカードの padding と box-shadow を調整する。
    - ファイル: `src/renderer/components/MessageItem/MessageItem.module.css`
    - 方針:
      | プロパティ | 変更前 | 変更後 | 理由 |
      |-----------|--------|--------|------|
      | `.card` padding | 16px 18px | 12px 16px | カード内の縦余白縮小 |
      | `.card` border-radius | 22px | 16px | コンパクトに合わせる |
      | `.card` box-shadow | `0 14px 32px ...` | 削除 | 全シャドウ削除 |
      | `.label` margin-bottom | 8px | 4px | ラベルと本文の間隔縮小 |

  - [ ] Task-1-7: ChatInput の余白圧縮・シャドウ削除
    - 説明: 入力欄の下余白、composer のシャドウ、セレクトボックスの高さを調整する。
    - ファイル: `src/renderer/components/ChatInput/ChatInput.module.css`
    - 方針:
      | プロパティ | 変更前 | 変更後 | 理由 |
      |-----------|--------|--------|------|
      | `.container` gap | 12px | 8px | オプションバーとの間隔縮小 |
      | `.container` padding | 10px 40px 36px | 8px 40px 16px | 下余白を大幅縮小 |
      | `.composer` padding | 14px 14px 14px 18px | 10px 12px 10px 16px | 入力欄内の余白縮小 |
      | `.composer` border-radius | 28px | 20px | コンパクトに合わせる |
      | `.composer` box-shadow | `0 18px 48px ...` | 削除 | 全シャドウ削除 |
      | `.composer:focus-within` box-shadow | `0 0 0 1px ..., 0 20px 44px ...` | `0 0 0 1px rgba(91,185,140,0.24)` | ドロップシャドウ削除、フォーカスリング（機能的UI）のみ維持 |
      | `.textarea` padding | 10px 8px | 8px 6px | テキストエリア内の縦余白縮小 |
      | `.sendButton` min-height | 48px | 40px | ボタン高さ縮小 |
      | `.sendButton` padding | 10px 18px | 8px 16px | ボタン余白縮小 |
      | `.sendButton` border-radius | 18px | 14px | コンパクトに合わせる |
      | `.sendButton:hover` box-shadow | `0 12px 24px ...` | 削除 | 全シャドウ削除 |
      | `.select` min-height | 42px | 34px | セレクトボックス高さ縮小 |
      | `.select` border-radius | 14px | 10px | コンパクトに合わせる |
      | `.select:focus` box-shadow | `0 0 0 1px ...` | 削除 | 全シャドウ削除 |
      | `.optionField` gap | 6px | 4px | ラベルとセレクトの間隔縮小 |

  - [ ] Task-1-8: global.css の微調整
    - 説明: `height: 100vh` への変更に合わせ、html/body/#root のスタイルを調整する。
    - ファイル: `src/renderer/global.css`
    - 方針:
      - `html, body, #root` に `height: 100%` を追加（`min-height` から変更）して、titleBar 込みのレイアウトが正しく機能するようにする。

- 受入基準:
  - [ ] アプリ起動時に OS 標準のタイトルバー・メニューバーが表示されない
  - [ ] ウィンドウ右上に最小化・最大化・閉じるボタンが表示される
  - [ ] タイトルバー領域のドラッグでウィンドウ移動が可能
  - [ ] Windows のスナップ操作が正常に動作する
  - [ ] 全コンポーネントの縦余白がコンパクトに削減されている
  - [ ] 全要素から box-shadow が除去されている（focus-within のフォーカスリングのみ例外維持）
  - [ ] チャット送受信、スクロール、モデル選択が正常に動作する
- 前提: なし

## フェーズ依存関係
Phase 1 のみ（単一フェーズ）

## 技術選定
- Electron `titleBarOverlay` API（Electron 20+ で安定サポート）
- `-webkit-app-region: drag` CSS プロパティ（Electron 標準）
- 追加ライブラリ: なし

## リスクと対策
- リスク1: titleBarOverlay の色が BrowserWindow 生成時に固定されるため、将来テーマ切り替えに対応する場合は `win.setTitleBarOverlay()` で動的に変更する必要がある → 対策: 現時点ではダークテーマ固定のため問題なし。将来テーマ機能を追加する際に対応する。
- リスク2: `-webkit-app-region: drag` がサイドバー内のボタンやリンクのクリックを妨げる可能性 → 対策: Electron は `<button>`, `<input>`, `<textarea>`, `<select>` を自動的にドラッグ対象外にする。テキスト要素のみの箇所で意図せずドラッグが反応しないか、実装後に動作確認する。
- リスク3: `padding-top: 36px` による既存レイアウトへの影響 → 対策: `height: 100vh` + `overflow: hidden` で全体のスクロールを抑止し、内部のスクロールは MessageList に任せる既存構造を維持する。
