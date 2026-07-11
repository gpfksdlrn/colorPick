# ColorPick

[![Release](https://img.shields.io/github/v/release/gpfksdlrn/colorPick?style=flat-square)](https://github.com/gpfksdlrn/colorPick/releases/latest)
[![Build](https://img.shields.io/github/actions/workflow/status/gpfksdlrn/colorPick/build.yml?branch=main&style=flat-square&label=build)](https://github.com/gpfksdlrn/colorPick/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![Download macOS](https://img.shields.io/badge/Download-macOS-black?style=flat-square&logo=apple)](https://github.com/gpfksdlrn/colorPick/releases/latest/download/ColorPick-mac.dmg)
[![Download Windows](https://img.shields.io/badge/Download-Windows-blue?style=flat-square&logo=windows)](https://github.com/gpfksdlrn/colorPick/releases/latest/download/ColorPick-win.exe)

## Development Background

디자인 및 개발 작업 중에는 화면의 색상을 추출하는 일이 자주 있습니다.
이 과정에서 다음과 같은 불편함이 있었습니다.

* **문제**: 웹 컬러피커 사이트를 쓰려면 매번 브라우저를 열고 사이트를 찾아
  들어가야 함
  * → **개선**: 전역 단축키로 화면 어디서든 바로 실행

* **문제**: 기본 스포이드 툴은 추출한 값이 클립보드로 복사되지 않아, 값을
  눈으로 보고 직접 타이핑해야 함
  * → **개선**: 클릭 한 번으로 자동 클립보드 복사

* **문제**: 필요한 포맷(HEX/RGB/HSL)이 다를 때마다 별도 변환 사이트를
  거쳐야 함
  * → **개선**: `F` 키로 세 포맷을 즉시 순환

이 세 가지 불편함을 해소하기 위해 ColorPick을 직접 만들게 되었습니다.

**ColorPick은 전역 단축키로 화면 어디서든 색상을 추출하고,
HEX / RGB / HSL 포맷으로 즉시 복사할 수 있는 크로스 플랫폼 데스크탑
툴입니다.**

---

## 📑 목차

* [Preview](#-preview)
* [주요 기능](#-주요-기능)
* [단축키](#-단축키)
* [기술 스택](#-기술-스택)
* [UI/UX 의사결정](#-uiux-의사결정)
* [개발 방식 — AI와의 협업](#-개발-방식--ai와의-협업)
* [기술적 도전 & 해결](#-기술적-도전--해결)
* [구조](#-구조)
* [설치](#-설치)
* [다운로드](#-다운로드)
* [회고 & 다음 계획](#-회고--다음-계획)
* [피드백 남기기](#-피드백-남기기)
* [제작자](#-제작자)

---

## 🖥 Preview

https://github.com/user-attachments/assets/8d8b660c-d45d-48f9-835f-e19ff2b776e9

* `0:00` 색상 실시간 미리보기
* `0:07` 포맷 순환(F)
* `0:15` 클릭 → 클립보드 복사
* `0:41` 단축키 설정 변경
* `0:51` 색상 히스토리

---

## ✨ 주요 기능

* 전역 단축키로 어디서든 컬러피커 실행
* 화면 픽셀 단위 색상 추출
* HEX / RGB / HSL 포맷 변환 (`F` 키로 순환)
* 클릭 시 자동 클립보드 복사
* 최근 복사 색상 히스토리 (트레이 메뉴, 최대 5개, 색상 미리보기 아이콘 포함)
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

| 영역 | 선택 | 근거 |
| --- | --- | --- |
| 데스크톱 프레임워크 | Electron | macOS/Windows를 단일 코드베이스로 지원해야 했고, 네이티브 언어(Swift/C#)로 두 플랫폼을 각각 구현하는 대신 JavaScript 기반으로 개발 속도를 확보하기 위해 채택 |
| 런타임 | Node.js | `desktopCapturer`, `clipboard`, `globalShortcut` 등 OS 레벨 API 접근에 사용 |
| UI | HTML / CSS / Vanilla JavaScript | 오버레이·트레이·토스트 UI 3종 모두 상태가 단순해 프레임워크 없이도 구현 가능하다고 판단, 러닝 커브와 번들 크기를 줄이기 위해 채택 |
| 로컬 저장소 | electron-store | 단축키 설정, 복사 포맷, 색상 히스토리를 JSON 파일로 영속화 |
| CI/CD | GitHub Actions | macOS/Windows 빌드를 병렬로 수행하고, 태그(`v*`) 푸시 시 두 빌드 아티팩트를 묶어 GitHub Release로 자동 배포 |

> TypeScript는 아직 도입하지 않았습니다. 현재는 모듈 수(6개)와 상태 구조가 단순해
> 타입 시스템 없이도 유지보수가 가능하다고 판단했으나, IPC로 주고받는 데이터
> 구조가 늘어나는 시점에는 마이그레이션이 필요하다고 보고 있습니다. ([회고 & 다음 계획](#-회고--다음-계획) 참고)

---

## 🎨 UI/UX 의사결정

### 1. 클릭 한 번으로 복사

* **결정**: 별도의 확인 버튼 없이 클릭 즉시 클립보드로 복사되도록 구현
* **근거**: 색상 추출은 빠르게 확인하고 바로 활용하는 용도이므로, 확인 절차가
  추가되면 작업 흐름이 끊깁니다. 대신 커서 하단 오버레이에 색상값을
  실시간으로 표시해 클릭 이전에 값을 확인할 수 있도록 보완했습니다.

### 2. F 키로 포맷 순환

* **결정**: HEX/RGB/HSL 포맷 전환을 드롭다운 대신 단축키 순환 방식으로 구현
* **근거**: 스포이드 조작 중에는 마우스보다 키보드 입력이 작업 흐름을 유지하는 데
  유리합니다. `F` 단축키는 오버레이가 열려 있는 동안에만 등록되고, 닫히면 즉시
  해제되도록 처리해 다른 앱에서의 단축키 충돌을 방지했습니다.

### 3. 최근 색상 히스토리 5개 제한

* **결정**: 트레이 메뉴에 노출되는 최근 색상 히스토리를 최대 5개로 제한하고,
  각 항목에 실제 색상을 렌더링한 아이콘을 함께 표시
* **근거**: 히스토리가 무제한으로 누적되면 메뉴 탐색 비용이 커지고, 실제 재사용되는
  색상은 대부분 직전 몇 개 안에 분포합니다. 텍스트만으로는 색상을 즉시
  구분하기 어려워, `nativeImage` 버퍼를 직접 그려 원형 색상 아이콘을 생성하는
  방식으로 시인성을 보완했습니다.

---

## 🤖 개발 방식 — AI와의 협업

Electron 및 네이티브 데스크톱 개발 경험이 없는 상태에서 시작한 프로젝트로,
Claude와의 설계 논의 → 구현 → 디버깅 → CI/CD 구성까지 전 과정을 바이브
코딩(Vibe Coding) 방식으로 진행했습니다. AI에게 구현을 위임하기보다, 매 단계에서
문제를 정의하고 제시된 옵션을 비교·검증한 뒤 방향을 직접 결정하는 방식으로
협업했습니다.

> 이 프로젝트는 AI와 협업해 개발 생산성을 높인 사례이며, Copilot Studio나 Agent
> SDK 기반으로 AI 에이전트 자체를 만든 프로젝트는 아닙니다. 두 경험은 구분해서
> 소개하고 있습니다.

### 1. 설계 논의

* **상황**: `globalShortcut`, `desktopCapturer` 등 처음 다루는 Electron API에
  대한 이해가 필요했음
* **협업 방식**: Claude와 API 문서 기반으로 구현 옵션(예: 픽셀 단위 추출 vs.
  영역 크롭 후 중심 픽셀 추출)을 비교한 뒤 구현 방향을 결정

### 2. 디버깅 — 멀티 디스플레이 좌표 오차

* **상황**: 듀얼 모니터 환경에서 스포이드가 가리키는 위치와 실제 추출되는
  색상 좌표가 어긋나는 버그 발생
* **원인**: 마우스 좌표는 논리적 픽셀(logical pixel) 기준인 반면, 화면 캡처
  결과는 디스플레이의 `scaleFactor`가 반영된 물리적 픽셀(physical pixel)
  기준이라 두 좌표계가 일치하지 않았음
* **협업 방식**: 로그로 좌표값 변화를 추적하며 원인 후보를 좁혀가다가, Claude와
  함께 `scaleFactor`를 곱해 좌표를 보정하는 로직으로 해결

### 3. 크로스 플랫폼 검증

* **상황**: macOS/Windows 양쪽 빌드를 매번 로컬에서 수동 검증해야 했음
* **협업 방식**: GitHub Actions로 두 플랫폼을 병렬 빌드하고 태그 푸시 시 자동
  릴리즈하는 CI/CD 파이프라인을 Claude와 함께 구성

---

## 🚧 기술적 도전 & 해결

### 1. 전역 단축키 (Global Shortcut)

* **문제**: 앱이 백그라운드/포커스 아웃 상태에서도 단축키가 동작해야 함
* **해결**: Electron `globalShortcut.register`로 OS 레벨 단축키를 등록. 사용자가
  설정에서 단축키를 변경하면 기존 등록을 해제한 뒤 재등록하도록 처리했고,
  앱 종료(`will-quit`) 시 `unregisterAll`로 정리해 다른 앱과의 단축키 충돌을
  방지

### 2. 화면 색상 추출 정확도와 성능

* **문제**: 화면 어디서든 정확한 픽셀 색상을 빠르게 추출해야 하며, 오버레이가
  떠 있는 동안 마우스가 움직일 때마다 반복 호출되므로 성능 저하 우려가 있었음
* **해결**:
  * `desktopCapturer.getSources`로 디스플레이별 캡처본을 가져오되, 디스플레이
    단위로 **50ms TTL 캐시**를 두어 동일 프레임 내 중복 캡처를 방지
  * 커서 좌표를 `scaleFactor`로 보정한 뒤, 단일 픽셀이 아닌 좌표 주변 11×11
    영역을 크롭하여 중심 픽셀 값을 사용 — 캡처 경계 오차로 인한 색상 오검출을
    줄이기 위한 처리
  * BGRA 순서의 비트맵에서 RGB를 역산해 HEX로 변환하고, HSL은 표준 변환 공식을
    직접 구현

### 3. 멀티 디스플레이 대응

* **문제**: 커서가 어떤 모니터에 있든 지연 없이 오버레이가 표시돼야 함
* **해결**: 오버레이 실행 시 `screen.getAllDisplays()`로 모든 디스플레이에
  프레임리스 투명 창을 동시에 생성해두고, 커서가 위치한 디스플레이의 창에만
  포커스를 부여

### 4. OS별 권한 이슈 대응

* **macOS**
  * **문제**: Screen Recording 권한이 없으면 캡처가 조용히 실패함
  * **해결**: `systemPreferences.getMediaAccessStatus('screen')`으로 권한 상태를
    확인하고, 거부/제한 상태면 안내 다이얼로그를 띄운 뒤 `shell.openExternal`로
    시스템 설정의 화면 녹화 권한 화면으로 바로 연결
* **Windows**
  * **문제**: 코드 서명이 되지 않은 배포판이라 실행 시 SmartScreen 경고가 발생
  * **해결**: README 설치 가이드에 "추가 정보 → 실행" 절차를 명시해 사용자
    혼란을 최소화

---

## 🧩 구조

* **Main Process** (`main.js`) — 앱 시작을 담당하며 전역 단축키 등록, 트레이 생성,
  IPC 채널(`get-shortcut`, `update-shortcut`)을 초기화합니다.
* **오버레이** (`overlay.js` + `colorPicker.js`) — 오버레이 창 생성과 화면 캡처/색상
  변환 로직을 분리해, 캡처 로직은 Electron UI에 의존하지 않는 순수 모듈로
  구현했습니다.
* **트레이** (`tray.js`) — 트레이 메뉴 구성과 설정창 오픈을 담당합니다.
* **설정 영속화** (`setting.js`) — `electron-store`로 단축키·복사 포맷·색상
  히스토리를 로컬 JSON에 저장하고, 트레이/오버레이 양쪽에서 공유합니다.
* **토스트** (`toast.js`) — 복사/포맷 변경 시 알림 창을 띄웁니다.
* **IPC 통신** — Renderer(오버레이 UI)가 마우스 좌표를 Main에 전달하면
  (`get-region`), Main이 색상 값을 계산해 반환하고, 클릭 시 `copy-and-close`로
  클립보드 복사와 히스토리 갱신, 토스트 알림까지 한 번에 처리합니다.

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

## 🔭 회고 & 다음 계획

* **TypeScript 마이그레이션**: IPC로 주고받는 색상/설정 데이터에 타입을 명시하면
  Main-Renderer 간 계약이 명확해질 것으로 판단, 점진적 도입을 계획하고 있습니다.
* **테스트 코드 도입**: 현재 자동화된 테스트가 없습니다. `rgbToHsl`, HEX 변환 등
  순수 함수부터 유닛 테스트를 추가할 예정입니다.
* **접근성(a11y) 점검**: 오버레이/설정 UI의 키보드 내비게이션과 스크린리더 대응
  수준을 점검할 예정입니다.

---

## 💬 피드백 남기기

🚀 사용자 피드백을 적극 반영 중입니다.

ColorPick을 더 좋게 만들고 싶습니다.  
작은 불편함이라도 좋으니 편하게 남겨주세요. 🙌

👉 [피드백 남기기](https://forms.gle/V5K8TFWAjE6mzebF9)

---

## 👤 제작자

**Hyeran Mun** ([@gpfksdlrn](https://github.com/gpfksdlrn))

License: [MIT](./LICENSE)
