# Supabase: 문의 접수 + 관리자 CRM

Project ref `shfdmlraappxyedacmok` · URL `https://shfdmlraappxyedacmok.supabase.co`

## 1. 스키마 적용 (SQL Editor)

1. Supabase 대시보드 → SQL Editor → New query
2. `supabase/migrations/0001_crm.sql` 전체를 붙여넣고 Run
3. 여러 번 실행해도 안전함(idempotent). 스키마를 바꿀 땐 이 파일과 `lib/supabase/types.ts` 를 같이 고친다.

만들어지는 것: `admins`(seed `admin@pluck.co.kr`), `inquiries`, `clients`, `projects`,
`project_tasks`, `project_payments`, `activity_log`, `is_admin()`, 입금 합계 트리거,
`purge_expired_inquiries()`, private 버킷 `inquiry-files`(10MB, pdf/png/jpg/zip/docx/pptx/xlsx).

### 접근 모델 (RLS)

- 모든 테이블 RLS on. `anon` 은 테이블 권한 자체가 없음.
- 공개 문의 폼은 Next.js 서버 액션이 `SUPABASE_SERVICE_ROLE_KEY` 로 insert (RLS 우회, 서버 전용).
- `authenticated` 는 JWT email 이 `public.admins` 에 있을 때만(`is_admin()`) 전체 접근.
- 첨부 파일: 서버가 만든 signed upload URL 로만 업로드, 관리자만 signed URL 로 열람.

### 관리자 추가

```sql
insert into public.admins (email) values ('someone@pluck.co.kr') on conflict do nothing;
```

그리고 Vercel 의 `ADMIN_EMAILS` 에도 같은 주소를 추가한다(둘 다 있어야 로그인됨).

## 2. Auth 설정

Authentication → Sign In / Providers

- Email provider 켜기, Magic link / OTP 사용. 비밀번호 로그인은 쓰지 않음.
- "Allow new users to sign up": 켜 둬도 됨 — 로그인 폼은 관리자 주소에만 메일을 보내고, 가입돼도 `admins` 에 없으면 RLS 로 아무것도 못 읽음.

Authentication → URL Configuration

- Site URL: `https://www.pluck.co.kr`
- Redirect URLs:
  - `https://www.pluck.co.kr/**`
  - `https://pluck.co.kr/**`
  - `http://localhost:3000/**`
  - (Vercel 프리뷰를 쓸 경우) `https://*-pluck-dev.vercel.app/**`

메일 템플릿(선택): Magic Link 템플릿에 `{{ .Token }}` 을 넣어 두면 링크 대신 6자리 코드로도
로그인할 수 있다(/admin/login 의 "코드 입력"). 기본 SMTP 는 시간당 발송 수가 적으니
운영 전 Custom SMTP 를 연결하는 것을 권장.

## 3. 환경 변수 (Vercel → Settings → Environment Variables)

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | O | `https://shfdmlraappxyedacmok.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | O | Project Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | O | service_role. 절대 `NEXT_PUBLIC_` 붙이지 말 것 |
| `ADMIN_EMAILS` | - | 쉼표 구분. 기본 `admin@pluck.co.kr` |
| `DISCORD_WEBHOOK_URL` | - | 새 문의 알림 채널 웹훅 |
| `IP_HASH_SALT` | - | 레이트 리밋용 IP 해시 솔트(긴 랜덤 문자열) |

키가 없으면: 사이트는 그대로 빌드되고, `/contact` 는 메일(admin@pluck.co.kr) 안내로, `/admin/login` 은
설정 안내로 표시된다. `/contact` 는 빌드 시점에 정적 생성되므로 env 추가 후 **재배포** 해야 폼이 켜진다.

## 4. 연결 확인

```bash
# .env.local 에 키를 넣은 뒤
npm run verify:supabase
```

연결, 7개 테이블 존재, `inquiry-files` 버킷, 테스트 문의 insert → delete 를 확인한다.

## 5. 보유기간 정리 (개인정보처리방침: 문의 1년)

프로젝트로 전환되지 않은 1년 지난 문의 삭제:

```sql
select public.purge_expired_inquiries();
```

pg_cron 을 켰다면 매일 실행:

```sql
select cron.schedule('purge-inquiries', '0 4 * * *', 'select public.purge_expired_inquiries()');
```

첨부 파일(`inquiry-files/pending/YYYY-MM/...`)은 Storage 에서 해당 월 폴더를 따로 지운다.
