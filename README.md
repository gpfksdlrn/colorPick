# ColorPick

[![Release](https://img.shields.io/github/v/release/gpfksdlrn/colorPick?style=flat-square)](https://github.com/gpfksdlrn/colorPick/releases/latest)
[![Download macOS](https://img.shields.io/badge/Download-macOS-black?style=flat-square&logo=apple)](https://github.com/gpfksdlrn/colorPick/releases/latest/download/ColorPick-mac.dmg)
[![Download Windows](https://img.shields.io/badge/Download-Windows-blue?style=flat-square&logo=windows)](https://github.com/gpfksdlrn/colorPick/releases/latest/download/ColorPick-win.exe)

디자인 작업이나 개발 중 화면에 보이는 색상을 빠르게 추출하고 싶을 때가
많은데, 매번 웹 컬러피커 사이트를 열거나 기본 스포이드로 뽑은 값을
복사하려면 잘 안 돼서 눈으로 보고 다시 타이핑해야 했습니다. 이 번거로움을
줄이려고 직접 만들었습니다.

**ColorPick은 전역 단축키로 어디서든 색상을 추출하고,
HEX / RGB / HSL 포맷으로 즉시 복사할 수 있는 크로스 플랫폼 데스크탑 툴입니다.**

---

## 📑 목차

* [Preview](#-preview)
* [주요 기능](#-주요-기능)
* [단축키](#️-단축키)
* [기술 스택](#-기술-스택)
* [UI/UX 의사결정](#-uiux-의사결정)
* [개발 방식 — AI와의 협업](#-개발-방식--ai와의-협업)
* [기술적 도전 & 해결](#-기술적-도전--해결)
* [구조](#-구조)
* [설치](#-설치)
* [다운로드](#-다운로드)
* [피드백 남기기](#-피드백-남기기)

---

## 🖥 Preview

https://github.com/user-attachments/assets/8d8b660c-d45d-48f9-835f-e19ff2b776e9

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
  * 네이티브 언어(Swift/C#) 없이도 이미 익숙한 JS로 데스크톱 앱을 빠르게
    완성할 수 있어서 선택

* **Node.js**

  * 시스템 API 접근 및 클립보드 제어

* **HTML / CSS / JavaScript**

  * UI 구성 — 별도 프레임워크 없이도 오버레이/트레이 UI 정도는 충분히
    구현 가능해서 러닝 커브와 번들 크기를 줄이기 위해 순수 JS로 유지

---

## 🎨 UI/UX 의사결정

### 1. 클릭 한 번으로 복사

* 결정: 별도 확인 버튼 없이 클릭 즉시 클립보드로 복사
* 이유: 색상 추출 도구는 빠르게 확인하고 바로 쓰는 용도라, 확인 버튼이 오히려
  작업 흐름을 끊는다고 판단. 대신 커서 아래 오버레이에 색상과 코드값을
  실시간으로 보여줘, 클릭 전에 한 번 더 확인할 수 있도록 함

### 2. F 키로 포맷 순환

* 결정: HEX/RGB/HSL을 드롭다운이 아닌 단축키 순환으로 전환
* 이유: 스포이드 사용 중에는 마우스보다 키보드 조작이 흐름을 안 끊음

### 3. 최근 색상 히스토리 5개 제한

* 결정: 트레이 메뉴에 최근 색상을 최대 5개까지만 노출
* 이유: 무제한으로 쌓으면 메뉴가 길어지고, 실제로 다시 찾는 색상은 대부분
  직전 몇 개 안에 있어서 UX 단순함과 실사용 빈도를 절충

---

## 🤖 개발 방식 — AI와의 협업

Electron과 네이티브 데스크톱 개발은 처음이었던 프로젝트로, Claude와 설계 논의
→ 구현 → 디버깅을 반복하며 완성했습니다.

### 1. 설계 논의

* 상황: globalShortcut, desktopCapturer 등 생소한 API를 다뤄야 함
* 협업 방식: Claude와 설계 옵션을 먼저 비교한 뒤 구현 방향을 결정

### 2. 디버깅

* 상황: 듀얼 모니터 환경에서 좌표가 어긋나는 버그 발생
* 협업 방식: 로그를 찍어 원인 후보를 좁혀가며 Claude와 함께 scaleFactor
  보정 로직으로 해결

### 3. 크로스 플랫폼 검증

* 상황: macOS/Windows 양쪽 빌드를 각각 검증해야 함
* 협업 방식: GitHub Actions로 병렬 빌드하는 CI/CD 파이프라인을 Claude와
  함께 구성해 자동 검증

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

1. `.dmg` 다운로드 후 설치
2. "손상되었기 때문에 열 수 없습니다" 오류 시 터미널에서 실행:
   ```bash
   xattr -cr /Applications/ColorPick.app
   ```
3. 이후 앱을 다시 실행하면 정상 작동합니다.

### Windows

1. `.exe` 다운로드 후 실행
2. SmartScreen 경고가 표시되면
   → "추가 정보" → "실행" 클릭

---

## 🔗 다운로드

* [macOS 다운로드](https://github.com/gpfksdlrn/colorPick/releases/latest/download/ColorPick-mac.dmg)
* [Windows 다운로드](https://github.com/gpfksdlrn/colorPick/releases/latest/download/ColorPick-win.exe)

---

## 💬 피드백 남기기

🚀 사용자 피드백을 적극 반영 중입니다.

ColorPick을 더 좋게 만들고 싶습니다.  
작은 불편함이라도 좋으니 편하게 남겨주세요. 🙌

👉 [피드백 남기기](https://forms.gle/V5K8TFWAjE6mzebF9)
