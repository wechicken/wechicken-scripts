# wechicken-scripts

> 운영에 필요한 스크립트 파일을 모아 둔 레포지토리 입니다.

## 데이터 마이그레이션

1. 먼저 `.env` 파일을 생성합니다.
2. `한남대교밑 Workspace > 팀 공간 > 백엔드`에서 필요한 정보를 봍북하세요
3. **wechicken-backend-2** 프로젝트 폴더에서 도커로 데이터 베이스 컨테이너를 띄웁니다.

```
npm install
npm run start:db
```

4. **wechicken-scripts** 프로젝트 폴더에서 테이블 싱크 및 데이터 마이그레이션 스크립트 파일 실행시키기

```
npm install
node schema-migrate.js
node data-migrate.js
```
