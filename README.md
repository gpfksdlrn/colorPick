# ColorPick

[![Release](https://img.shields.io/github/v/release/gpfksdlrn/colorPick?style=flat-square)](https://github.com/gpfksdlrn/colorPick/releases/latest)
[![Download macOS](https://img.shields.io/badge/Download-macOS-black?style=flat-square&logo=apple)](https://github.com/gpfksdlrn/colorPick/releases/latest/download/ColorPick-mac.dmg)
[![Download Windows](https://img.shields.io/badge/Download-Windows-blue?style=flat-square&logo=windows)](https://github.com/gpfksdlrn/colorPick/releases/latest/download/ColorPick-win.exe)

디자인 작업이나 개발 중 화면에 보이는 색상을 빠르게 추출하고 싶지만,
기본 도구는 접근성이 떨어지고 포맷 변환이 번거롭습니다.

**ColorPick은 전역 단축키로 어디서든 색상을 추출하고,
HEX / RGB / HSL 포맷으로 즉시 복사할 수 있는 크로스 플랫폼 데스크탑 툴입니다.**

---

## 🖥 Preview

(첨부 예정)

---

## ✨ 주요 기능

* 전역 단축키로 어디서든 컬러피커 실행
* 화면 픽셀 단위 색상 추출
* HEX / RGB / HSL 포맷 변환 (`F` 키로 순환)
* 클릭 시 자동 클립보드 복사
* 최근 복사 색상 히스토리 (트레이 메뉴, 최대 5개)
* 단축키 커스터마이징 (트레이 메뉴 → 설정)
* macOS / Windows 지원

---

## ⌨️ 단축키

| 동작           | macOS       | Windows        |
| ------------ | ----------- | -------------- |
| 컬러피커 열기 / 닫기 | `⌘ Shift C` | `Ctrl Shift C` |
| 색상 복사        | Click       | Click          |
| 포맷 변경        | `F`         | `F`            |
| 닫기           | `Esc`       | `Esc`          |

실행 단축키는 트레이 메뉴 → **설정**에서 변경할 수 있습니다.

---

## 🛠 기술 스택

* **Electron**

  * macOS / Windows 크로스 플랫폼 지원
* **Node.js**

  * 시스템 API 접근 및 클립보드 제어
* **HTML / CSS / JavaScript**

  * UI 구성

---

## 🚧 기술적 도전 & 해결

### 1. 전역 단축키(Global Shortcut)

* 문제: 앱이 백그라운드 상태에서도 실행되어야 함
* 해결: Electron의 globalShortcut API로 OS 레벨 단축키 등록

### 2. 화면 색상 추출

* 문제: 화면 어디서든 정확한 픽셀 색상 필요
* 해결: 화면 캡처 후 특정 좌표의 픽셀 색상 추출

### 3. OS별 권한 이슈 대응

* macOS

  * 문제: Screen Recording 권한 없으면 캡처 불가
  * 해결: 권한 요청 가이드 및 UX 안내

* Windows

  * 문제: 일부 환경에서 보안 경고 또는 권한 제한 발생
  * 해결: 실행 가이드 및 예외 처리

---

## 🧩 구조

* **Main Process**

  * 전역 단축키 등록
  * 클립보드 제어
* **Renderer Process**

  * UI 렌더링
* **IPC 통신**

  * Main ↔ Renderer 간 데이터 전달

---

## 📦 설치

### macOS

1. `.dmg` 다운로드 후 실행
2. "확인되지 않은 개발자" 경고 시
   → Finder에서 앱 우클릭 → 열기

### Windows

1. `.exe` 다운로드 후 실행
2. SmartScreen 경고가 표시되면
   → "추가 정보" → "실행" 클릭

---

## 🔗 다운로드

* [macOS 다운로드](https://github.com/gpfksdlrn/colorPick/releases/latest/download/ColorPick-mac.dmg)
* [Windows 다운로드](https://github.com/gpfksdlrn/colorPick/releases/latest/download/ColorPick-win.exe)
