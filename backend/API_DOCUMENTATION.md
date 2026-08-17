# Tithi Packers and Movers — Current API Documentation

Only APIs currently mounted in `app.js` are documented here. Booking pricing rules are exposed through `/api/booking-pricing-rules`; there is still no `/api/pricing` route.

## 1. Common frontend contract

Base URL: `http://localhost:5000`

Normal response:

```json
{
  "success": true,
  "statuscode": 200,
  "message": "Success message",
  "data": {}
}
```

Always read `payload.data`. Use `payload.message` for toast/error text.

Admin APIs require HTTP-only cookies. `admin_session` is the short-lived access cookie; `admin_refresh` is the longer refresh cookie used by `/api/admin-auth/refresh`:

```js
const response = await fetch(`${API_URL}/api/items/admin/catalog`, {
  credentials: "include"
});
const payload = await response.json();
```

Booking draft update/preview/confirm APIs require:

```http
x-draft-token: TOKEN_RETURNED_BY_CREATE_DRAFT
```

Error response:

```json
{
  "success": false,
  "statuscode": 400,
  "message": "Validation message",
  "error": []
}
```

Reusable frontend helpers:

```js
async function publicGet(path, query = {}) {
  const url = new URL(`${API_URL}${path}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });
  const response = await fetch(url);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message);
  return payload.data;
}

async function adminRequest(path, method = "GET", body) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message);
  return payload.data;
}

async function draftRequest(path, method = "GET", body, draftToken) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "x-draft-token": draftToken,
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message);
  return payload.data;
}
```

## 2. Current modules

| Module | Base route | Purpose |
|---|---|---|
| Health | `/`, `/api/v1/health` | Server status |
| Site settings | `/api/site-setting` | Company/site content |
| Branch | `/api/branch` | Branch CRUD |
| Contact | `/api/contact` | Customer inquiries |
| FAQ | `/api/faq` | FAQ CRUD |
| Testimonial | `/api/testimonial` | Testimonial CRUD |
| Legal | `/api/legal` | Legal pages |
| Items | `/api/items` | Sections, groups, items and multi-size variants |
| Add-ons | `/api/addon` | Add-on CRUD and group triggers |
| Booking pricing rules | `/api/booking-pricing-rules` | Admin-managed base price, allowance, distance, floor, lift, truck and hourly rules |
| OTP | `/api/otp` | Mobile verification |
| Booking | `/api/bookings` | Booking and frontend-calculated snapshot |
| Admin auth | `/api/admin-auth` | Admin session |
| Analytics | `/api/admin-analytics` | Dashboard/analytics |
| Notifications | `/api/notification` | SMS/WhatsApp records |
| In-app alerts | `/api/in-app-notifications` | Dashboard alerts |

### 2.1 Complete route index

Access legend:

- **Public**: no login/header required.
- **Admin**: send `credentials: "include"`; browser automatically sends `admin_session`, and the frontend helper refreshes it once with `admin_refresh` on `401`.
- **Draft**: send `x-draft-token`; this is not admin authentication.
- **Public (current)**: route currently has no auth middleware even if used by an admin screen.

#### Health and content

| Method/API | Access | Frontend sends | Success status/message | Successful `data` |
|---|---|---|---|---|
| `GET /` | Public | Nothing | `200`, welcome message | Unwrapped welcome JSON |
| `GET /api/v1/health` | Public | Nothing | `200`, `Thithi Packers Api Health check` | Unwrapped health JSON |
| `GET /api/site-setting` | Public | Nothing | `200`, `Site setting Fetched Successfully` | Site-setting object |
| `PATCH /api/site-setting` | Admin | Changed site fields | `200`, `site setting update successfully` | Updated site-setting object |
| `GET /api/branch` | Public | Nothing | `200`, `Branches fetched successfully` | Active branch array |
| `GET /api/branch/main` | Public | Nothing | `200`, `Main branch fetched successfully` | Main branch or first active branch |
| `GET /api/branch/:id` | Public | Branch MongoDB ID | `200`, `Branch fetched successfully` | Branch object |
| `POST /api/branch` | Admin | Branch body | `201`, `Branch Created Successfully` | Created branch |
| `PATCH /api/branch/:id` | Admin | Changed branch fields | `200`, `Branch updated successfully` | Updated branch |
| `DELETE /api/branch/:id` | Admin | Branch ID | `200`, `Branch deactivated successfully` | Branch with `isActive: false` |
| `POST /api/contact` | Public | Inquiry body | `201`, `Contact inquiry submitted successfully` | Created inquiry |
| `GET /api/contact?status=new` | Admin | Optional `status` query | `200`, `Contact inquiries fetched successfully` | Newest-first inquiry array |
| `GET /api/contact/:id` | Admin | Inquiry ID | `200`, `Contact inquiry fetched successfully` | Inquiry object |
| `PATCH /api/contact/:id` | Admin | `status`/`adminNotes` or changed fields | `200`, `Contact inquiry updated successfully` | Updated inquiry |
| `DELETE /api/contact/:id` | Admin | Inquiry ID | `200`, `Contact inquiry deleted successfully` | Permanently deleted inquiry |
| `GET /api/faq?category=pricing` | Public | Optional `category` | `200`, `FAQs fetched successfully` | Active FAQ array |
| `GET /api/faq/:id` | Public | FAQ ID | `200`, `FAQ fetched successfully` | FAQ object |
| `POST /api/faq` | Admin | FAQ body | `201`, `FAQ created successfully` | Created FAQ |
| `PATCH /api/faq/:id` | Admin | Changed FAQ fields | `200`, `FAQ updated successfully` | Updated FAQ |
| `DELETE /api/faq/:id` | Admin | FAQ ID | `200`, `FAQ deactivated successfully` | FAQ with `isActive: false` |
| `GET /api/testimonial` | Public | Optional `featured`, `serviceType` | `200`, `Testimonials fetched successfully` | Active testimonial array |
| `GET /api/testimonial/admin/all` | Admin | Optional `status`, `featured`, `serviceType` | `200`, `Admin testimonials fetched successfully` | Matching testimonial array |
| `GET /api/testimonial/:id` | Admin | Testimonial ID | `200`, `Testimonial fetched successfully` | Testimonial object |
| `POST /api/testimonial` | Admin | Testimonial body | `201`, `Testimonial created successfully` | Created testimonial |
| `PATCH /api/testimonial/:id` | Admin | Changed fields | `200`, `Testimonial updated successfully` | Updated testimonial |
| `DELETE /api/testimonial/:id` | Admin | Testimonial ID | `200`, `Testimonial deactivated successfully` | Testimonial with `status: inactive` |
| `GET /api/legal/:slug` | Public | Published slug | `200`, `Legal page fetched successfully` | Published legal page |
| `GET /api/legal/all` | Admin | Optional `isPublished`, `type` | `200`, `Legal pages fetched successfully` | Legal-page array |
| `GET /api/legal/id/:id` | Admin | Legal MongoDB ID | `200`, `Legal page fetched successfully` | Legal page |
| `POST /api/legal` | Admin | Legal-page body | `201`, `Legal page created successfully` | Created page |
| `PATCH /api/legal/:id` | Admin | Changed fields | `200`, `Legal page updated successfully` | Updated page |
| `DELETE /api/legal/:id` | Admin | Legal-page ID | `200`, `Legal page unpublished successfully` | Page with `isPublished: false` |

#### Item APIs

| Method/API | Access | Frontend sends | Success status/message | Successful `data` |
|---|---|---|---|---|
| `GET /api/items` | Public | Item filter queries | `200`, `Active items fetched` | Flat active item array |
| `GET /api/items/catalog` | Public | Section/group/item filters | `200`, `Section and group-wise catalog fetched` | `sections[].groups[].items[].sizes[]` |
| `GET /api/items/sections` | Public | Nothing | `200`, `Active sections fetched` | Active section array |
| `GET /api/items/groups` | Public | `sectionId`, `section`, `search` | `200`, `Active groups fetched` | Active group array |
| `GET /api/items/sizes` | Public | Nothing | `200`, `Active size choices fetched` | Active global-size array |
| `GET /api/items/admin/catalog` | Admin | Catalog filters including `isActive` | `200`, `Admin section and group-wise catalog fetched` | Nested admin catalog |
| `GET /api/items/admin/items` | Admin | Item filters including `isActive` | `200`, `Admin items fetched` | Flat admin item array |
| `POST /api/items/admin/items` | Admin | `groupId`, `name`, `sizes[]`, optional fields | `201`, `Item created` | Created item |
| `PATCH /api/items/admin/items/:id` | Admin | Changed item fields | `200`, `Item updated` | Updated item |
| `DELETE /api/items/admin/items/:id` | Admin | Item ID | `200`, `Item deactivated` | Item with `isActive: false` |
| `GET /api/items/admin/sections` | Admin | Optional `isActive` | `200`, `Sections fetched` | Section array |
| `POST /api/items/admin/sections` | Admin | Section body | `201`, `Section created` | Created section |
| `PATCH /api/items/admin/sections/:id` | Admin | Changed section fields | `200`, `Section updated` | Updated section |
| `DELETE /api/items/admin/sections/:id` | Admin | Section ID | `200`, `Section and its groups/items deactivated` | Deactivated section |
| `GET /api/items/admin/groups` | Admin | Section/search/status filters | `200`, `Groups fetched` | Group array |
| `POST /api/items/admin/groups` | Admin | `sectionId`, `name`, optional fields | `201`, `Group created` | Created group |
| `PATCH /api/items/admin/groups/:id` | Admin | Changed group fields | `200`, `Group updated` | Updated group |
| `DELETE /api/items/admin/groups/:id` | Admin | Group ID | `200`, `Group and its items deactivated` | Deactivated group |
| `GET /api/items/admin/sizes` | Admin | Optional `isActive` | `200`, `Size choices fetched` | Global-size array |
| `POST /api/items/admin/sizes` | Admin | Size body | `201`, `Size choice created` | Created size |
| `PATCH /api/items/admin/sizes/:id` | Admin | Changed size fields | `200`, `Size choice updated` | Updated size |
| `DELETE /api/items/admin/sizes/:id` | Admin | Size ID | `200`, `Size choice deactivated` | Deactivated size |

#### Add-on, booking pricing, OTP and booking APIs

| Method/API | Access | Frontend sends | Success status/message | Successful `data` |
|---|---|---|---|---|
| `GET /api/addon/available` | Public | Required `serviceType`; `itemIds` or `groupIds` | `200`, `Available add-ons fetched successfully` | Matching/global add-on array |
| `GET /api/addon/admin/all` | Admin | Optional `isActive`, `serviceType` | `200`, `Add-on services fetched successfully` | Add-on array |
| `GET /api/addon/admin/trigger-groups` | Admin | `search`, `section`, `sectionId`, `limit` | `200`, `Searchable add-on trigger groups fetched successfully` | Dropdown group array |
| `GET /api/addon/:id` | Admin | Add-on ID | `200`, `Add-on service fetched successfully` | Add-on object |
| `POST /api/addon` | Admin | Add-on body | `201`, `Add-on service created successfully` | Created add-on |
| `PATCH /api/addon/:id` | Admin | Changed add-on fields | `200`, `Add-on service updated successfully` | Updated add-on |
| `DELETE /api/addon/:id` | Admin | Add-on ID | `200`, `Add-on service deactivated successfully` | Add-on with `isActive: false` |
| `GET /api/booking-pricing-rules` | Public | Optional `serviceType` | `200`, `Booking pricing rules fetched` | Active pricing-rule array |
| `GET /api/booking-pricing-rules/:serviceType` | Public | Service type | `200`, `Booking pricing rule fetched` | Active rule for one service |
| `GET /api/booking-pricing-rules/admin/all` | Admin | Optional `serviceType`, `isActive` | `200`, `Admin booking pricing rules fetched` | Pricing-rule array |
| `GET /api/booking-pricing-rules/admin/:id` | Admin | Rule MongoDB ID | `200`, `Admin booking pricing rule fetched` | Pricing-rule object |
| `POST /api/booking-pricing-rules/admin/defaults` | Admin | Nothing | `201`, `Default booking pricing rules created` | Created defaults only |
| `POST /api/booking-pricing-rules/admin` | Admin | Pricing-rule body | `201`, `Booking pricing rule created` | Created pricing rule |
| `PATCH /api/booking-pricing-rules/admin/:id` | Admin | Changed pricing-rule fields | `200`, `Booking pricing rule updated` | Updated pricing rule |
| `DELETE /api/booking-pricing-rules/admin/:id` | Admin | Rule MongoDB ID | `200`, `Booking pricing rule deactivated` | Rule with `isActive: false` |
| `POST /api/otp/send` | Public/rate-limited | `mobile`, optional `purpose` | `201`, `OTP sent successfully` | OTP timing and APitxt request metadata |
| `POST /api/otp/resend` | Public/rate-limited | Same as send | `201`, `OTP sent successfully` | New OTP timing |
| `POST /api/otp/verify` | Public/rate-limited | `mobile`, `otp`, optional `purpose` | `200`, `Mobile number verified successfully` | `verified`, `verificationId`, `verifiedAt` |
| `POST /api/bookings/draft` | Public/rate-limited | Initial booking body | `201`, `Booking draft created` | `{ booking, draftToken }` |
| `PATCH /api/bookings/:bookingId/draft` | Draft | Editable draft fields | `200`, `Booking draft updated` | Complete updated draft |
| `GET /api/bookings/:bookingId/quote` | Draft | Booking ID + token | `200`, `Submitted pricing snapshot fetched` | Submitted snapshot |
| `POST /api/bookings/:bookingId/confirm` | Draft/rate-limited | Customer, verification ID when enabled, optional pricing | `201`, `Booking confirmed successfully` | Confirmed booking |
| `GET /api/bookings/track/:bookingId` | Public | Required `mobile` query | `200`, `Booking tracking details fetched` | Safe tracking object |
| `GET /api/bookings/admin/all` | Admin | `status`, `serviceType`, `mobile`, `limit` | `200`, `Bookings fetched` | Booking array |
| `GET /api/bookings/admin/:bookingId` | Admin | Public booking ID | `200`, `Booking fetched` | Complete booking |
| `PATCH /api/bookings/admin/:bookingId/status` | Admin | `status`, optional `note` | `200`, `Booking status updated` | Updated booking |
| `PATCH /api/bookings/admin/:bookingId/quote` | Admin | `pricing`, optional `note` | `200`, `Admin pricing snapshot updated` | Updated booking |

#### Admin auth, analytics and notification APIs

| Method/API | Access | Frontend sends | Success status/message | Successful `data` |
|---|---|---|---|---|
| `POST /api/admin-auth/login` | Public/rate-limited | `email`, `password` | `200`, `Admin login successful` | `admin`, `accessExpiresAt`, `expiresAt`; sets `admin_session` and `admin_refresh` cookies |
| `GET /api/admin-auth/me` | Admin | Nothing | `200`, `Admin session fetched` | Current admin |
| `POST /api/admin-auth/refresh` | Refresh cookie | Nothing | `200`, `Admin session refreshed` | `admin`, `accessExpiresAt`, `expiresAt`; rotates `admin_session` |
| `POST /api/admin-auth/logout` | Admin | Nothing | `200`, `Admin logged out` | `null`; clears both cookies |
| `PATCH /api/admin-auth/change-password` | Admin | `currentPassword`, `newPassword` | `200`, `Password changed. Please log in again` | Admin; sessions revoked |
| `PATCH /api/admin-auth/profile` | Admin | `currentPassword`, optional `name`, `email` | `200`, `Admin profile updated` | Updated admin |
| `GET /api/admin-analytics/dashboard` | Public (current) | Nothing | `200`, `Admin dashboard statistics fetched` | Cards, graph, most-used service, recent bookings |
| `GET /api/admin-analytics/overview` | Public (current) | Nothing | `200`, `Admin analytics fetched` | Estimated revenue/popularity analytics |
| `GET /api/notification` | Public (current) | Notification filter queries | `200`, `Notifications fetched successfully` | Notification array |
| `GET /api/notification/:id` | Public (current) | Notification ID | `200`, `Notification fetched successfully` | Notification object |
| `POST /api/notification/send` | Public (current) | Single notification body | `201`, `Notification sent successfully` | Delivery record |
| `POST /api/notification/broadcast` | Admin | Disabled for now | `400`, broadcast disabled | Error only |
| `DELETE /api/notification/:id` | Public (current) | Notification ID | `200`, `Notification deleted successfully` | Deleted record |
| `GET /api/in-app-notifications` | Public (current) | `isRead`, `type`, `limit` | `200`, `In-app notifications fetched` | Alert array |
| `GET /api/in-app-notifications/summary` | Public (current) | Nothing | `200`, `Notification dashboard summary fetched` | Today/unread/upcoming summary |
| `POST /api/in-app-notifications/new-booking` | Public (current) | `bookingId` | `201`, `New booking notification created` | Idempotent alert |
| `PATCH /api/in-app-notifications/read-all` | Public (current) | Nothing | `200`, `All notifications marked as read` | `{ updatedCount }` |
| `PATCH /api/in-app-notifications/:id/read` | Public (current) | Alert ID | `200`, `Notification marked as read` | Updated alert |
| `DELETE /api/in-app-notifications/:id` | Public (current) | Alert ID | `200`, `In-app notification deleted` | Deleted alert |

## 3. Item module — frontend and admin

### 3.1 Data hierarchy

```text
Section tab
  └── Group
       └── Item
            └── Multiple selectable size variants with prices
```

Example:

```text
Living Room
  └── Sofa
       ├── 1 Seater Sofa
       │    ├── L  → ₹288
       │    └── XL → ₹350
       └── 2 Seater Sofa
            └── XL → ₹324
```

Section is the top-level frontend/admin tab. Group is the clickable row/card inside the section. Opening a group shows its items. Each item contains `sizes[]`; the user selects one size variant and frontend uses that variant's `price`.

### 3.2 Public section/group catalog

#### Complete catalog

```http
GET /api/items/catalog
```

#### One section tab

Do not include quotes around query values. URL-encode spaces:

```http
GET /api/items/catalog?section=Living%20Room
```

#### One group inside a section

```http
GET /api/items/catalog?section=Living%20Room&group=Sofa
```

#### Search items inside the catalog

```http
GET /api/items/catalog?section=Living%20Room&search=sofa
```

Supported catalog queries:

| Query | Example | Meaning |
|---|---|---|
| `section` | `Living Room` | Exact section name, case-insensitive |
| `sectionId` | MongoDB ID | Exact section ID |
| `group` | `Sofa` | Exact group name, case-insensitive |
| `groupId` | MongoDB ID | Exact group ID |
| `size` | `XL` | Items containing that size choice |
| `search` | `sofa` | Item-name search |

Catalog response in `data`:

```json
[
  {
    "_id": "SECTION_ID",
    "key": "living-room",
    "name": "Living Room",
    "section": "Living Room",
    "description": "",
    "isActive": true,
    "sortOrder": 0,
    "groups": [
      {
        "_id": "GROUP_ID",
        "key": "sofa",
        "categoryId": "SECTION_ID",
        "section": "Living Room",
        "name": "Sofa",
        "description": "",
        "isActive": true,
        "sortOrder": 0,
        "items": [
          {
            "_id": "ITEM_ID",
            "key": "living-room-sofa-1-seater-sofa",
            "categoryId": "SECTION_ID",
            "section": "Living Room",
            "groupId": "GROUP_ID",
            "group": "Sofa",
            "name": "1 Seater Sofa",
            "sizes": [
              {
                "_id": "ITEM_SIZE_VARIANT_ID",
                "sizeId": {
                  "_id": "GLOBAL_SIZE_ID",
                  "key": "L",
                  "label": "L",
                  "isActive": true
                },
                "sizeKey": "L",
                "label": "L",
                "price": 288,
                "isActive": true,
                "sortOrder": 0
              }
            ],
            "isActive": true,
            "sortOrder": 0
          }
        ]
      }
    ]
  }
]
```

Frontend rendering:

```js
const sections = payload.data;

sections.map((section) =>
  section.groups.map((group) =>
    group.items.map((item) =>
      item.sizes.filter((size) => size.isActive)
    )
  )
);
```

### 3.3 Other public item APIs

| Method | API | Query | `data` |
|---|---|---|---|
| GET | `/api/items` | `section`, `sectionId`, `group`, `groupId`, `size`, `search` | Flat active item array |
| GET | `/api/items/sections` | None | Active section array for tabs |
| GET | `/api/items/groups?section=Living%20Room&search=sofa` | `sectionId`, `section`, `search` | Active group array |
| GET | `/api/items/sizes` | None | Active global size choices |

### 3.4 Admin catalog

```http
GET /api/items/admin/catalog?section=Living%20Room&group=Sofa&isActive=true
Cookie: admin_session=...
```

The response uses the same `sections[].groups[].items[].sizes[]` structure. Admin catalog may include inactive records when `isActive=false` is requested.

Flat admin list:

```http
GET /api/items/admin/items?sectionId=SECTION_ID&groupId=GROUP_ID&size=XL&search=sofa&isActive=true
```

### 3.5 Admin section CRUD

```json
{
  "name": "Office",
  "description": "Office furniture and equipment",
  "sortOrder": 5,
  "isActive": true
}
```

| Method | API | Body/query | Result |
|---|---|---|---|
| GET | `/api/items/admin/sections?isActive=true` | Optional `isActive=true|false` | Section array |
| POST | `/api/items/admin/sections` | Body above | Create section |
| PATCH | `/api/items/admin/sections/:id` | Changed fields | Update section and item/group section snapshots |
| DELETE | `/api/items/admin/sections/:id` | None | Deactivate section and its groups/items |

`key` is optional and generated from `name`.

### 3.6 Admin group CRUD

Create group inside a selected section:

```json
{
  "sectionId": "SECTION_ID",
  "name": "Sofa",
  "description": "All sofa items",
  "sortOrder": 1,
  "isActive": true
}
```

| Method | API | Body/query | Result |
|---|---|---|---|
| GET | `/api/items/admin/groups?sectionId=SECTION_ID&search=sofa&isActive=true` | Optional filters | Group array with populated section |
| POST | `/api/items/admin/groups` | Body above | Create group |
| PATCH | `/api/items/admin/groups/:id` | Changed fields, optional new `sectionId` | Rename/move group and update its items |
| DELETE | `/api/items/admin/groups/:id` | None | Deactivate group and its items |

For an Add Item form, first load sections, then load groups using the selected `sectionId`. To create a new section/group during item creation, call the section/group POST API, keep the returned `_id`, then send that group ID in the item POST.

### 3.7 Global size-choice CRUD

Global sizes control what sizes can be added to an item:

```json
{
  "key": "5XL",
  "label": "Extra Large 5XL",
  "description": "Very large item",
  "sortOrder": 9,
  "isActive": true
}
```

| Method | API | Body/query | Result |
|---|---|---|---|
| GET | `/api/items/admin/sizes?isActive=true` | Optional `isActive` | Size-choice array |
| POST | `/api/items/admin/sizes` | Body above | Create size choice |
| PATCH | `/api/items/admin/sizes/:id` | Changed fields | Update size and embedded item labels/keys |
| DELETE | `/api/items/admin/sizes/:id` | None | Deactivate choice and matching item variants |

### 3.8 Admin item create with multiple sizes

```http
POST /api/items/admin/items
Content-Type: application/json
Cookie: admin_session=...
```

```json
{
  "groupId": "GROUP_ID",
  "name": "Premium Sofa",
  "sizes": [
    {
      "sizeId": "SIZE_L_ID",
      "price": 300,
      "sortOrder": 0,
      "isActive": true
    },
    {
      "sizeId": "SIZE_XL_ID",
      "price": 450,
      "sortOrder": 1,
      "isActive": true
    }
  ],
  "sortOrder": 10,
  "isActive": true
}
```

Backend gets section and group names from `groupId`; frontend does not need to send duplicate `section`/`group` strings.

### 3.9 Item update/delete and size add/remove

`PATCH` replaces the complete `sizes` array when `sizes` is sent. To add a size, include old sizes plus the new size. To remove a size, omit it or send `isActive: false`.

```http
PATCH /api/items/admin/items/ITEM_ID
```

```json
{
  "name": "Premium Sofa Updated",
  "groupId": "GROUP_ID",
  "sizes": [
    { "sizeId": "SIZE_L_ID", "price": 325, "isActive": true },
    { "sizeId": "SIZE_XXL_ID", "price": 550, "isActive": true }
  ]
}
```

| Method | API | Result |
|---|---|---|
| PATCH | `/api/items/admin/items/:id` | Updated item |
| DELETE | `/api/items/admin/items/:id` | Soft-deactivated item |

## 4. Add-on module — group triggers

Add-ons trigger on groups, not item names or individual item IDs. Example: add-on trigger is `Sofa`. Selecting any active item inside Sofa (`1 Seater`, `2 Seater`, etc.) makes that add-on available.

Backend does not calculate add-on totals. It returns add-on data/price; frontend calculates selected quantity/total and posts the booking snapshot.

### 4.1 Admin trigger-group dropdown

```http
GET /api/addon/admin/trigger-groups?search=sofa&section=Living%20Room&limit=30
```

Supported queries:

| Query | Meaning |
|---|---|
| `search` | Partial group-name search |
| `section` | Exact section name |
| `sectionId` | Exact section ID |
| `limit` | Default 30, maximum 100 |

Response `data`:

```json
[
  {
    "id": "SOFA_GROUP_ID",
    "key": "sofa",
    "name": "Sofa",
    "sectionId": "LIVING_ROOM_SECTION_ID",
    "section": "Living Room",
    "label": "Living Room - Sofa"
  }
]
```

Use `data[].id` as dropdown value.

### 4.2 Create/update add-on

```json
{
  "key": "premium-sofa-packing",
  "name": "Premium Sofa Packing",
  "description": "Extra packing for all sofa items",
  "unit": "per_item",
  "price": 500,
  "appliesToServiceTypes": ["local_shifting", "intercity_moving"],
  "triggerGroupIds": ["SOFA_GROUP_ID"],
  "isOptional": true,
  "isActive": true,
  "sortOrder": 1
}
```

Valid unit: `global | flat | per_unit | per_item | per_group | per_category | per_room | percentage`.

| Method | API | Query/body | Result |
|---|---|---|---|
| GET | `/api/addon/admin/all?isActive=true&serviceType=local_shifting` | Optional filters | Add-ons with populated trigger groups |
| GET | `/api/addon/admin/trigger-groups?search=sofa` | Dropdown filters | Trigger group choices |
| GET | `/api/addon/:id` | Add-on ID | One add-on |
| POST | `/api/addon` | Add-on body | Created add-on |
| PATCH | `/api/addon/:id` | Changed fields including `price`/`triggerGroupIds` | Updated add-on |
| DELETE | `/api/addon/:id` | None | Soft-deactivated add-on |

An empty `triggerGroupIds: []` means the add-on is global for its selected service types.

### 4.3 User-side add-on matching

Frontend sends selected item IDs:

```http
GET /api/addon/available?serviceType=local_shifting&itemIds=ITEM_ID_1,ITEM_ID_2
```

Backend resolves every selected item's `groupId`, then returns global add-ons plus add-ons matching any selected group.

Direct group IDs are also supported:

```http
GET /api/addon/available?serviceType=local_shifting&groupIds=SOFA_GROUP_ID,BED_GROUP_ID
```

Response `data`:

```json
[
  {
    "_id": "ADDON_ID",
    "key": "premium-sofa-packing",
    "name": "Premium Sofa Packing",
    "unit": "per_item",
    "price": 500,
    "triggerGroupIds": [
      { "_id": "SOFA_GROUP_ID", "name": "Sofa", "section": "Living Room" }
    ],
    "isGlobal": false,
    "matchedTriggerGroupIds": ["SOFA_GROUP_ID"]
  }
]
```

Frontend should render this returned array directly. No item-name filter is needed.

## 5. Booking pricing rules module

This module stores the dynamic pricing configuration used by the booking frontend. Admin manages rules; user side only reads active rules and calculates the booking snapshot before sending it to `/api/bookings`.

Supported service types: `local_shifting | intercity_moving | porter_labour_service`.

Important behavior:

- `local_shifting` and `intercity_moving` can use base price, free item allowance, distance slabs, floor slabs and lift rules.
- `porter_labour_service` can use truck rates and hourly rates.
- Backend stores these rules. It does not automatically recalculate existing booking totals from these rules.
- Item extra charge comes from selected item-size variant price in `/api/items/catalog` when quantity crosses the configured free allowance.

### 5.1 Public pricing rules

All active rules:

```http
GET /api/booking-pricing-rules
```

Filter by one service:

```http
GET /api/booking-pricing-rules?serviceType=local_shifting
```

Direct service route:

```http
GET /api/booking-pricing-rules/local_shifting
```

Success response:

```json
{
  "success": true,
  "statuscode": 200,
  "message": "Booking pricing rule fetched",
  "data": {
    "_id": "RULE_ID",
    "serviceType": "local_shifting",
    "name": "Local shifting pricing",
    "currency": "INR",
    "basePrice": 1499,
    "freeItemAllowance": [
      { "sizeKey": "XS", "quantity": 4 },
      { "sizeKey": "S", "quantity": 3 },
      { "sizeKey": "M", "quantity": 1 },
      { "sizeKey": "L", "quantity": 1 },
      { "sizeKey": "XL", "quantity": 1 },
      { "sizeKey": "XXL", "quantity": 1 }
    ],
    "distancePricing": {
      "enabled": true,
      "slabs": [
        { "label": "0-2 km", "fromKm": 0, "toKm": 2, "ratePerKm": 0, "isFree": true },
        { "label": "2-5 km", "fromKm": 2, "toKm": 5, "ratePerKm": 35, "isFree": false },
        { "label": "5-30 km", "fromKm": 5, "toKm": 30, "ratePerKm": 22, "isFree": false },
        { "label": "30-75 km", "fromKm": 30, "toKm": 75, "ratePerKm": 26, "isFree": false },
        { "label": "75+ km", "fromKm": 75, "toKm": null, "ratePerKm": 26, "isFree": false }
      ]
    },
    "floorPricing": {
      "enabled": true,
      "slabs": [
        { "label": "1-2 floor", "fromFloor": 1, "toFloor": 2, "charge": 0 },
        { "label": "3-5 floor", "fromFloor": 3, "toFloor": 5, "charge": 170 },
        { "label": "6-8 floor", "fromFloor": 6, "toFloor": 8, "charge": 270 },
        { "label": "9-11 floor", "fromFloor": 9, "toFloor": 11, "charge": 350 },
        { "label": "12+ floor", "fromFloor": 12, "toFloor": null, "charge": 450 }
      ]
    },
    "liftPricing": {
      "enabled": true,
      "withLiftCharge": 0,
      "withoutLiftCharge": 0,
      "notes": ""
    },
    "labourPricing": {
      "enabled": false,
      "trucks": [],
      "hourlyRates": []
    },
    "isActive": true
  }
}
```

### 5.2 Admin create default rules

Use this once to create missing default rules for all supported services. Existing service rules are not duplicated.

```http
POST /api/booking-pricing-rules/admin/defaults
Cookie: admin_session=...
```

Success response:

```json
{
  "success": true,
  "statuscode": 201,
  "message": "Default booking pricing rules created",
  "data": [
    {
      "_id": "LOCAL_RULE_ID",
      "serviceType": "local_shifting",
      "name": "Local shifting pricing",
      "basePrice": 1499
    }
  ]
}
```

If all defaults already exist, `data` is an empty array.

### 5.3 Admin create/update local or intercity rule

```http
POST /api/booking-pricing-rules/admin
Cookie: admin_session=...
Content-Type: application/json
```

Request body:

```json
{
  "serviceType": "local_shifting",
  "name": "Local shifting pricing",
  "description": "Base, item allowance, distance, floor and lift rules for local shifting bookings.",
  "currency": "INR",
  "basePrice": 1499,
  "freeItemAllowance": [
    { "sizeKey": "XS", "quantity": 4 },
    { "sizeKey": "S", "quantity": 3 },
    { "sizeKey": "M", "quantity": 1 },
    { "sizeKey": "L", "quantity": 1 },
    { "sizeKey": "XL", "quantity": 1 },
    { "sizeKey": "XXL", "quantity": 1 }
  ],
  "distancePricing": {
    "enabled": true,
    "slabs": [
      { "label": "0-2 km", "fromKm": 0, "toKm": 2, "ratePerKm": 0, "isFree": true, "sortOrder": 1 },
      { "label": "2-5 km", "fromKm": 2, "toKm": 5, "ratePerKm": 35, "isFree": false, "sortOrder": 2 },
      { "label": "5-30 km", "fromKm": 5, "toKm": 30, "ratePerKm": 22, "isFree": false, "sortOrder": 3 },
      { "label": "30-75 km", "fromKm": 30, "toKm": 75, "ratePerKm": 26, "isFree": false, "sortOrder": 4 },
      { "label": "75+ km", "fromKm": 75, "toKm": null, "ratePerKm": 26, "isFree": false, "sortOrder": 5 }
    ]
  },
  "floorPricing": {
    "enabled": true,
    "slabs": [
      { "label": "1-2 floor", "fromFloor": 1, "toFloor": 2, "charge": 0, "sortOrder": 1 },
      { "label": "3-5 floor", "fromFloor": 3, "toFloor": 5, "charge": 170, "sortOrder": 2 },
      { "label": "6-8 floor", "fromFloor": 6, "toFloor": 8, "charge": 270, "sortOrder": 3 },
      { "label": "9-11 floor", "fromFloor": 9, "toFloor": 11, "charge": 350, "sortOrder": 4 },
      { "label": "12+ floor", "fromFloor": 12, "toFloor": null, "charge": 450, "sortOrder": 5 }
    ]
  },
  "liftPricing": {
    "enabled": true,
    "withLiftCharge": 0,
    "withoutLiftCharge": 0,
    "notes": "Set withoutLiftCharge if no lift needs extra handling."
  },
  "isActive": true,
  "sortOrder": 1
}
```

Create success:

```json
{
  "success": true,
  "statuscode": 201,
  "message": "Booking pricing rule created",
  "data": {
    "_id": "RULE_ID",
    "serviceType": "local_shifting",
    "basePrice": 1499,
    "isActive": true
  }
}
```

Update request:

```http
PATCH /api/booking-pricing-rules/admin/RULE_ID
Cookie: admin_session=...
Content-Type: application/json
```

```json
{
  "basePrice": 1599,
  "distancePricing": {
    "slabs": [
      { "label": "0-2 km", "fromKm": 0, "toKm": 2, "ratePerKm": 0, "isFree": true, "sortOrder": 1 },
      { "label": "2-5 km", "fromKm": 2, "toKm": 5, "ratePerKm": 40, "isFree": false, "sortOrder": 2 }
    ]
  }
}
```

Patch preserves missing nested fields, but any nested array sent in the body replaces that array.

### 5.4 Admin labour rule with truck and hourly rates

```http
POST /api/booking-pricing-rules/admin
Cookie: admin_session=...
Content-Type: application/json
```

Request body:

```json
{
  "serviceType": "porter_labour_service",
  "name": "Porter labour pricing",
  "description": "Truck and hourly-rate rules for porter labour bookings.",
  "currency": "INR",
  "basePrice": 0,
  "distancePricing": { "enabled": false, "slabs": [] },
  "floorPricing": { "enabled": false, "slabs": [] },
  "liftPricing": { "enabled": false, "withLiftCharge": 0, "withoutLiftCharge": 0 },
  "labourPricing": {
    "enabled": true,
    "trucks": [
      { "key": "mini_truck", "name": "Mini truck", "capacityLabel": "Small load", "price": 1200, "isActive": true, "sortOrder": 1 },
      { "key": "pickup", "name": "Pickup truck", "capacityLabel": "Medium load", "price": 1800, "isActive": true, "sortOrder": 2 }
    ],
    "hourlyRates": [
      { "hours": 1, "label": "1 hour", "price": 500, "isActive": true, "sortOrder": 1 },
      { "hours": 2, "label": "2 hours", "price": 900, "isActive": true, "sortOrder": 2 },
      { "hours": 5, "label": "5 hours", "price": 2000, "isActive": true, "sortOrder": 5 }
    ]
  },
  "isActive": true,
  "sortOrder": 3
}
```

Public response for labour:

```json
{
  "success": true,
  "statuscode": 200,
  "message": "Booking pricing rule fetched",
  "data": {
    "serviceType": "porter_labour_service",
    "basePrice": 0,
    "distancePricing": { "enabled": false, "slabs": [] },
    "floorPricing": { "enabled": false, "slabs": [] },
    "labourPricing": {
      "enabled": true,
      "trucks": [
        { "key": "mini_truck", "name": "Mini truck", "capacityLabel": "Small load", "price": 1200 },
        { "key": "pickup", "name": "Pickup truck", "capacityLabel": "Medium load", "price": 1800 }
      ],
      "hourlyRates": [
        { "hours": 1, "label": "1 hour", "price": 500 },
        { "hours": 2, "label": "2 hours", "price": 900 },
        { "hours": 5, "label": "5 hours", "price": 2000 }
      ]
    }
  }
}
```

### 5.5 Admin remaining APIs

| Method | API | Query/body | Result |
|---|---|---|---|
| GET | `/api/booking-pricing-rules/admin/all?isActive=true&serviceType=local_shifting` | Optional filters | Pricing rules |
| GET | `/api/booking-pricing-rules/admin/:id` | Rule ID | One pricing rule |
| POST | `/api/booking-pricing-rules/admin/defaults` | None | Creates missing defaults |
| POST | `/api/booking-pricing-rules/admin` | Rule body | Created pricing rule |
| PATCH | `/api/booking-pricing-rules/admin/:id` | Changed fields | Updated pricing rule |
| DELETE | `/api/booking-pricing-rules/admin/:id` | None | Soft-deactivated pricing rule |

Validation notes:

- `serviceType` must be one of `local_shifting`, `intercity_moving`, `porter_labour_service`.
- `freeItemAllowance[].sizeKey` must be one of `XS`, `S`, `M`, `L`, `XL`, `XXL`.
- Distance slabs use `fromKm`, `toKm`, `ratePerKm`; `toKm: null` means open-ended.
- Floor slabs use `fromFloor`, `toFloor`, `charge`; `toFloor: null` means open-ended.
- One active or inactive rule can exist per service type because `serviceType` is unique.

## 6. Booking module — frontend calculation

Supported service types: `local_shifting | intercity_moving | porter_labour_service`.

### Create draft

```http
POST /api/bookings/draft
```

```json
{
  "serviceType": "local_shifting",
  "pickuplocation": {
    "address": "Vesu",
    "city": "Surat",
    "state": "Gujarat",
    "pincode": "395007",
    "floor": 2,
    "liftavailable": true
  },
  "droplocation": {
    "address": "Adajan",
    "city": "Surat",
    "state": "Gujarat",
    "pincode": "395009",
    "floor": 1,
    "liftavailable": false
  },
  "distanceKm": 12,
  "scheduledate": "2026-07-10T09:00:00.000Z",
  "timeslot": "morning"
}
```

Save returned `data.booking.bookingid` and `data.draftToken`.

Create-draft success:

```json
{
  "success": true,
  "statuscode": 201,
  "message": "Booking draft created",
  "data": {
    "booking": {
      "bookingid": "TPM-20260706-AB12CD34",
      "serviceType": "local_shifting",
      "status": "draft",
      "currentStep": "locations"
    },
    "draftToken": "SAVE_THIS_TOKEN"
  }
}
```

### Update draft with selected size and frontend price

```http
PATCH /api/bookings/:bookingId/draft
x-draft-token: DRAFT_TOKEN
```

```json
{
  "items": [
    {
      "itemId": "ITEM_ID",
      "itemkey": "living-room-sofa-1-seater-sofa",
      "category": "Living Room",
      "name": "1 Seater Sofa",
      "sizeTag": "L",
      "quantity": 2,
      "unitPrice": 288,
      "lineTotal": 576,
      "options": { "sizeVariantId": "ITEM_SIZE_VARIANT_ID", "groupId": "SOFA_GROUP_ID" }
    }
  ],
  "selectedAddons": [
    {
      "addonid": "ADDON_ID",
      "key": "premium-sofa-packing",
      "name": "Premium Sofa Packing",
      "unit": "per_item",
      "quantity": 2,
      "pricesnapshot": 500,
      "total": 1000
    }
  ],
  "pricing": {
    "currency": "INR",
    "itemTotal": 576,
    "addOnTotal": 1000,
    "serviceCharge": 1200,
    "discount": 100,
    "tax": 0,
    "totalAmount": 2676,
    "breakdown": {}
  }
}
```

Backend validates non-negative numeric fields and stores the snapshot. It does not calculate or compare the total.

Confirm request:

```http
POST /api/bookings/:bookingId/confirm
x-draft-token: DRAFT_TOKEN
Content-Type: application/json
```

```json
{
  "customer": {
    "name": "Ravi Shah",
    "email": "ravi@example.com",
    "mobile": "9876543210"
  },
  "verificationId": "OTP_VERIFICATION_ID"
}
```

`customer.name` and `customer.mobile` are required. `verificationId` is required only when `BOOKING_REQUIRE_OTP` is enabled. Confirm may also include a final `pricing` object; otherwise saved draft pricing is used. Success is `201`, message `Booking confirmed successfully`, and `data` is the complete confirmed booking with `status: pending`, `pricing`, `quoteSnapshot`, and `confirmedAt`.

Tracking response contains only `bookingid`, `serviceType`, `status`, `currentStep`, schedule/time slot, pickup/drop locations, `quoteSnapshot`, confirmation date and creation date.

### Remaining booking APIs

| Method | API | Auth/query/body | Result |
|---|---|---|---|
| GET | `/api/bookings/:bookingId/quote` | `x-draft-token` | Submitted snapshot |
| POST | `/api/bookings/:bookingId/confirm` | Token + customer + OTP verification ID when enabled | Confirm booking |
| GET | `/api/bookings/track/:bookingId?mobile=9876543210` | Required mobile | Safe tracking data |
| GET | `/api/bookings/admin/all?status=pending&serviceType=local_shifting&limit=50` | Admin | Booking array |
| GET | `/api/bookings/admin/:bookingId` | Admin | Complete booking |
| PATCH | `/api/bookings/admin/:bookingId/status` | `{ "status": "confirmed", "note": "Team assigned" }` | Updated status |
| PATCH | `/api/bookings/admin/:bookingId/quote` | `{ "pricing": {...}, "note": "Corrected" }` | Admin-submitted snapshot |

## 7. Admin authentication

Login frontend example:

```js
const response = await fetch(`${API_URL}/api/admin-auth/login`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
});
const payload = await response.json();
```

Login `data`:

```json
{
  "admin": {
    "id": "ADMIN_ID",
    "name": "Tithi Admin",
    "email": "admin@example.com",
    "role": "super_admin",
    "mustChangePassword": false,
    "lastLoginAt": "2026-07-06T10:00:00.000Z"
  },
  "expiresAt": "2026-07-13T10:00:00.000Z"
}
```

| Method | API | Body | Result |
|---|---|---|---|
| POST | `/api/admin-auth/login` | `{ "email": "admin@example.com", "password": "..." }` | Sets cookie; returns admin/expiry |
| GET | `/api/admin-auth/me` | Admin cookie | Current admin |
| POST | `/api/admin-auth/logout` | Admin cookie | Clears session |
| PATCH | `/api/admin-auth/change-password` | `{ currentPassword, newPassword }` | Changes password and revokes sessions |
| PATCH | `/api/admin-auth/profile` | `{ currentPassword, name?, email? }` | Updated profile |

All admin fetch calls require `credentials: "include"`.

## 8. OTP

Send/resend `data`:

```json
{
  "mobile": "9876543210",
  "purpose": "booking",
  "expiresInSeconds": 300,
  "resendAfterSeconds": 60,
  "provider": "apitxt",
  "requestId": "SMS-OTP-A1B2C3D4",
  "deliveryCost": 0.25
}
```

OTP delivery uses APitxt via `APITXT_AUTHKEY` in the backend environment. Verify `data`:

```json
{
  "mobile": "9876543210",
  "purpose": "booking",
  "verified": true,
  "verificationId": "OTP_RECORD_ID",
  "verifiedAt": "2026-07-06T10:00:00.000Z"
}
```

| Method | API | Body | Result |
|---|---|---|---|
| POST | `/api/otp/send` | `{ "mobile": "9876543210", "purpose": "booking" }` | OTP timing |
| POST | `/api/otp/resend` | Same | New OTP timing |
| POST | `/api/otp/verify` | `{ "mobile": "9876543210", "otp": "452134", "purpose": "booking" }` | `verificationId` |

## 9. Content/admin modules

### 9.1 Site-setting module

| API | Access | Auth/token | Request | Success `data` |
|---|---|---|---|---|
| `GET /api/site-setting` | Public | None | No params/body | Complete site-setting object |
| `PATCH /api/site-setting` | Admin | `admin_session` cookie + `credentials: "include"` | Changed setting fields as JSON | Updated site-setting object |

`x-draft-token` is not used in this module. PATCH also needs `Content-Type: application/json`.

Site-setting request/response fields:

```json
{
  "companyName": "Tithi Packers and Movers",
  "tagline": "Safe and reliable moving",
  "aboutTitle": "About us",
  "aboutDescription": "Company description",
  "phone": "9876543210",
  "whatsappNumber": "919876543210",
  "email": "hello@example.com",
  "address": "Surat, Gujarat",
  "logoUrl": "https://example.com/logo.png",
  "socialLinks": {
    "facebook": "https://facebook.com/example",
    "instagram": "https://instagram.com/example",
    "linkedin": "",
    "youtube": "",
    "twitter": ""
  },
  "stats": {
    "yearsExperience": 5,
    "successfulMoves": 3000,
    "citiesCovered": 25,
    "customerSatisfaction": 98
  },
  "seo": {
    "metaTitle": "Packers and Movers",
    "metaDescription": "Moving service",
    "keywords": ["packers", "movers"]
  }
}
```

### 9.2 Branch module

| API | Access | Auth/token | Request | Success `data` |
|---|---|---|---|---|
| `GET /api/branch` | Public | None | No params/body | Active branches array |
| `GET /api/branch/main` | Public | None | No params/body | Main branch or first active branch |
| `GET /api/branch/:id` | Public | None | Branch MongoDB `_id` in path | One branch object |
| `POST /api/branch` | Admin | Admin cookie | Branch JSON body | Created branch; HTTP `201` |
| `PATCH /api/branch/:id` | Admin | Admin cookie | Branch `_id` + changed fields | Updated branch |
| `DELETE /api/branch/:id` | Admin | Admin cookie | Branch `_id`; no body | Soft-deactivated branch |

Admin means `credentials: "include"`; no draft token. DELETE sets `isActive: false`, it does not permanently remove the record.

Branch POST body and returned branch shape:

```json
{
  "branchName": "Surat Main Branch",
  "city": "Surat",
  "state": "Gujarat",
  "address": "Vesu, Surat",
  "phone": "9876543210",
  "email": "surat@example.com",
  "coordinates": { "lat": 21.1702, "lng": 72.8311 },
  "isMainBranch": true,
  "isActive": true,
  "sortOrder": 1
}
```

Required branch fields: `branchName`, `city`, `address`. PATCH may send only changed fields. If `isMainBranch: true` is saved, other branches are unset as main.

| Method | API | Auth/result |
|---|---|---|
| GET | `/api/site-setting` | Public site object |
| PATCH | `/api/site-setting` | Admin; changed setting fields |
| GET | `/api/branch` | Public active branches |
| GET | `/api/branch/main` | Public main branch |
| GET | `/api/branch/:id` | Public branch |
| POST/PATCH/DELETE | `/api/branch`, `/api/branch/:id` | Admin branch CRUD |

### 9.3 Contact module

| API | Access | Auth/token | Request | Success `data` |
|---|---|---|---|---|
| `POST /api/contact` | Public | None | `{ name, mobile, email?, subject?, message }` | Created inquiry; HTTP `201` |
| `GET /api/contact` | Admin | Admin cookie | Optional query `status` | Newest-first inquiry array |
| `GET /api/contact/:id` | Admin | Admin cookie | Inquiry `_id` | One inquiry |
| `PATCH /api/contact/:id` | Admin | Admin cookie | Changed fields, normally `status`, `adminNotes` | Updated inquiry |
| `DELETE /api/contact/:id` | Admin | Admin cookie | Inquiry `_id`; no body | Permanently deleted inquiry |

Admin calls require `credentials: "include"`; this module never uses `x-draft-token`.

Contact POST body:

```json
{
  "name": "Ravi Shah",
  "mobile": "9876543210",
  "email": "ravi@example.com",
  "subject": "Local shifting",
  "message": "I need shifting service"
}
```

Required: `name`, `mobile`, `message`. Admin PATCH example:

```json
{ "status": "contacted", "adminNotes": "Customer called" }
```

Contact status: `new | contacted | resolved | spam`.

### 9.4 FAQ module

| API | Access | Auth/token | Request | Success `data` |
|---|---|---|---|---|
| `GET /api/faq` | Public | None | Optional query `category` | Active FAQ array |
| `GET /api/faq/:id` | Public | None | FAQ `_id` | One FAQ object |
| `POST /api/faq` | Admin | Admin cookie | FAQ JSON body | Created FAQ; HTTP `201` |
| `PATCH /api/faq/:id` | Admin | Admin cookie | Changed FAQ fields | Updated FAQ |
| `DELETE /api/faq/:id` | Admin | Admin cookie | FAQ `_id`; no body | FAQ with `isActive: false` |

GET list only returns active FAQs. DELETE is a soft delete. Admin calls use `credentials: "include"`.

FAQ POST/PATCH object:

```json
{
  "question": "How do I book?",
  "answer": "Select items and confirm the booking.",
  "category": "booking",
  "sortOrder": 1,
  "isActive": true
}
```

Required: `question`, `answer`. GET returns the same fields plus `_id`, `createdAt`, `updatedAt`.

### 9.5 Testimonial module

| API | Access | Auth/token | Request | Success `data` |
|---|---|---|---|---|
| `GET /api/testimonial` | Public | None | Optional `featured`, `serviceType` query | Matching active testimonials |
| `GET /api/testimonial/admin/all` | Admin | Admin cookie | Optional `status`, `featured`, `serviceType` | All matching testimonials |
| `GET /api/testimonial/:id` | Admin | Admin cookie | Testimonial `_id` | One testimonial |
| `POST /api/testimonial` | Admin | Admin cookie | Testimonial JSON | Created testimonial; HTTP `201` |
| `PATCH /api/testimonial/:id` | Admin | Admin cookie | Changed fields | Updated testimonial |
| `DELETE /api/testimonial/:id` | Admin | Admin cookie | Testimonial `_id`; no body | Testimonial with `status: inactive` |

Only the first route is public. DELETE is a soft delete. Admin requests use the cookie, not booking draft token.

Testimonial POST/PATCH object:

```json
{
  "name": "Meera Patel",
  "location": "Surat",
  "rating": 5,
  "content": "Very good service",
  "imageUrl": "https://example.com/meera.jpg",
  "serviceType": "local_shifting",
  "isFeatured": true,
  "status": "active",
  "sortOrder": 1
}
```

Required: `name`, `rating` (1–5), `content`. Valid service type: `general | local_shifting | intercity_moving | business_relocation | ordinary_services`. Status: `active | inactive`.

### 9.6 Legal-pages module

| API | Access | Auth/token | Request | Success `data` |
|---|---|---|---|---|
| `GET /api/legal/:slug` | Public | None | Published page `slug` | One published legal page |
| `GET /api/legal/all` | Admin | Admin cookie | Optional `isPublished`, `type` | Legal-page array |
| `GET /api/legal/id/:id` | Admin | Admin cookie | Legal page `_id` | One legal page |
| `POST /api/legal` | Admin | Admin cookie | Legal-page JSON | Created page; HTTP `201` |
| `PATCH /api/legal/:id` | Admin | Admin cookie | Changed fields | Updated page |
| `DELETE /api/legal/:id` | Admin | Admin cookie | Page `_id`; no body | Page with `isPublished: false` |

DELETE unpublishes the page; it does not permanently delete it. `type` and `slug` must remain unique.

Legal POST/PATCH object:

```json
{
  "type": "privacy_policy",
  "title": "Privacy Policy",
  "slug": "privacy-policy",
  "content": "<h1>Privacy Policy</h1>",
  "isPublished": true
}
```

Required: `type`, `title`, `slug`, `content`. Valid type: `privacy_policy | terms_conditions | refund_policy | cancellation_policy`.

| Method | API | Query/body |
|---|---|---|
| POST | `/api/contact` | `{ name, mobile, email?, subject?, message }` |
| GET | `/api/contact?status=new` | Admin inquiry list |
| GET/PATCH/DELETE | `/api/contact/:id` | Admin detail/update/delete |
| GET | `/api/faq?category=pricing` | Public active FAQs |
| GET | `/api/faq/:id` | Public FAQ |
| POST/PATCH/DELETE | `/api/faq`, `/api/faq/:id` | Admin CRUD |
| GET | `/api/testimonial?featured=true&serviceType=local_shifting` | Public list |
| GET | `/api/testimonial/admin/all?status=active&featured=true` | Admin list |
| GET/POST/PATCH/DELETE | `/api/testimonial/:id`, `/api/testimonial` | Admin CRUD |
| GET | `/api/legal/:slug` | Public published page |
| GET | `/api/legal/all?isPublished=true&type=privacy_policy` | Admin list |
| GET/POST/PATCH/DELETE | `/api/legal/id/:id`, `/api/legal`, `/api/legal/:id` | Admin CRUD |

Frontend examples:

```js
const branches = await publicGet("/api/branch");
const pricingFaqs = await publicGet("/api/faq", { category: "pricing" });
const testimonials = await publicGet("/api/testimonial", {
  featured: true,
  serviceType: "local_shifting"
});

const createdFaq = await adminRequest("/api/faq", "POST", faqForm);
const updatedInquiry = await adminRequest(`/api/contact/${id}`, "PATCH", {
  status: "resolved",
  adminNotes: "Completed"
});
```

## 10. Admin analytics module

| API | Access | Auth/token | Request | Success `data` |
|---|---|---|---|---|
| `GET /api/admin-analytics/dashboard` | Public (current implementation) | None | No params/body | Cards, daily graph, most-used service, recent bookings |
| `GET /api/admin-analytics/overview` | Public (current implementation) | None | No params/body | Revenue estimates and service popularity |

These routes are intended for the admin dashboard but currently have no `adminAuth` middleware. This table describes actual code behavior.

Analytics dashboard `data` example:

```json
{
  "stats": {
    "totalBookings": 120,
    "pendingBookings": 18,
    "inProgressBookings": 7,
    "completedBookings": 95
  },
  "dailyBookingGraph": [{ "date": "2026-07-06", "bookings": 4 }],
  "mostUsedService": {
    "serviceType": "local_shifting",
    "label": "Local Shifting",
    "bookings": 70
  },
  "recentBookings": []
}
```

Analytics overview `data` contains `currency`, `estimatedRevenue`, `averageBookingValue`, `highestDemandService`, `revenueGrowth30Days`, and `servicePopularityBreakdown`. Revenue is estimated from frontend-submitted booking totals, not payment-collected revenue.

### 10.1 Customer notification module

| API | Access | Auth/token | Request | Success `data` |
|---|---|---|---|---|
| `GET /api/notification` | Public (current) | None | Optional `status`, `type`, `channel`, `customerMobile`, `bookingId`, `limit` | Notification array |
| `GET /api/notification/:id` | Public (current) | None | Notification `_id` | One notification |
| `POST /api/notification/send` | Public (current) | None | Single-message body below | Delivery record; HTTP `201` |
| `POST /api/notification/broadcast` | Admin | None | Disabled for now | Error only |
| `DELETE /api/notification/:id` | Public (current) | None | Notification `_id`; no body | Permanently deleted record |

Current route code has no auth middleware, so neither admin cookie nor draft token is required. Secure these routes before production if only admins may send messages.

Single notification POST body:

```json
{
  "bookingId": "BOOKING_MONGODB_ID",
  "customerMobile": "9876543210",
  "customerName": "Ravi Shah",
  "channel": "whatsapp",
  "type": "admin_message",
  "title": "Booking update",
  "message": "Our team will arrive at 10 AM",
  "meta": {}
}
```

Required: `customerMobile`, `channel`, `type`, `message`. Channel: `sms | whatsapp`. The returned record includes delivery `status: pending | sent | failed`, provider details and timestamps.

Broadcast is currently disabled. Use single-customer messaging instead. Previous broadcast body shape:

```json
{
  "targetCustomers": [
    { "name": "Ravi", "mobile": "9876543210" },
    { "name": "Meera", "mobile": "9876543211" }
  ],
  "channel": "whatsapp",
  "type": "admin_broadcast",
  "title": "Offer",
  "message": "Weekend offer available",
  "meta": {}
}
```

Notification GET queries: `status`, `type`, `channel`, `customerMobile`, `bookingId`, `limit`.

In-app list queries: `isRead=true|false`, `type=new_booking|booking_reminder|system`, `limit` (1–100).

### 10.2 In-app notification module

| API | Access | Auth/token | Request | Success `data` |
|---|---|---|---|---|
| `GET /api/in-app-notifications` | Public (current) | None | `isRead`, `type`, `limit` (1-100) | In-app alert array |
| `GET /api/in-app-notifications/summary` | Public (current) | None | No params/body | Today/unread/upcoming summary |
| `POST /api/in-app-notifications/new-booking` | Public (current) | None | `{ "bookingId": "BOOKING_MONGODB_ID" }` | Created or reused alert; HTTP `201` |
| `PATCH /api/in-app-notifications/read-all` | Public (current) | None | No body | `{ "updatedCount": number }` |
| `PATCH /api/in-app-notifications/:id/read` | Public (current) | None | Alert `_id`; no body | Updated alert with `isRead`, `readAt` |
| `DELETE /api/in-app-notifications/:id` | Public (current) | None | Alert `_id`; no body | Permanently deleted alert |

Alert fields are `_id`, `type`, `title`, `message`, `bookingId`, `isRead`, `readAt`, `meta`, `createdAt`, `updatedAt`. Valid `type`: `new_booking | booking_reminder | system`. Current route code has no auth middleware.

| Method | API | Query/body/result |
|---|---|---|
| GET | `/api/admin-analytics/dashboard` | Dashboard cards, graph, recent bookings |
| GET | `/api/admin-analytics/overview` | Estimated revenue and popularity |
| GET | `/api/notification?status=sent&channel=whatsapp&limit=50` | Notification records |
| GET/DELETE | `/api/notification/:id` | Notification detail/delete |
| POST | `/api/notification/send` | `{ customerMobile, customerName?, channel, type, title?, message }` |
| POST | `/api/notification/broadcast` | Disabled for now |
| GET | `/api/in-app-notifications?isRead=false&type=new_booking&limit=25` | Admin alert list |
| GET | `/api/in-app-notifications/summary` | Unread/today/upcoming summary |
| POST | `/api/in-app-notifications/new-booking` | `{ "bookingId": "BOOKING_MONGODB_ID" }` |
| PATCH | `/api/in-app-notifications/read-all` | Mark all read |
| PATCH | `/api/in-app-notifications/:id/read` | Mark one read |
| DELETE | `/api/in-app-notifications/:id` | Delete alert |

Frontend examples:

```js
const dashboard = await publicGet("/api/admin-analytics/dashboard");
const sentNotifications = await publicGet("/api/notification", {
  status: "sent",
  channel: "whatsapp",
  limit: 50
});

const notification = await fetch(`${API_URL}/api/notification/send`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(notificationForm)
}).then((response) => response.json());
```

Note: analytics, customer-notification and in-app-notification routes currently have no `adminAuth` middleware. The route index labels them **Public (current)** so frontend behavior matches the actual backend.

## 11. Frontend integration order

### User

1. `GET /api/items/catalog` and render section tabs.
2. User opens a group and sees its nested items.
3. User selects an item size from `item.sizes[]`.
4. Fetch `/api/booking-pricing-rules/:serviceType` for base price, free allowance and service-specific rules.
5. Send selected item IDs to `/api/addon/available`.
6. Calculate item/add-on/distance/floor/labour totals in frontend.
7. Create/update booking draft and post the full snapshot.
8. OTP verify when enabled, then confirm booking.

### Admin item form

1. Fetch `/api/items/admin/sections` for section choice.
2. Fetch `/api/items/admin/groups?sectionId=...` for group choice.
3. Fetch `/api/items/admin/sizes?isActive=true` for multi-size rows.
4. Create missing section/group first if needed.
5. POST item using `groupId` plus `sizes[]`.
6. PATCH/DELETE each item from the nested admin catalog.

### Admin add-on form

1. Search `/api/addon/admin/trigger-groups?search=...`.
2. Save selected group IDs in `triggerGroupIds`.
3. POST/PATCH add-on name, price, unit and group triggers.
4. User-side availability automatically matches selected item groups.

### Admin pricing rules form

1. Fetch `/api/booking-pricing-rules/admin/all`.
2. If needed, POST `/api/booking-pricing-rules/admin/defaults`.
3. Edit base price, allowance, distance, floor, lift, truck or hourly arrays per service.
4. PATCH `/api/booking-pricing-rules/admin/:id`; frontend users read only the active public rule.

## 12. Errors

| Status | Meaning |
|---|---|
| 400 | Invalid query/body/ID |
| 401 | Admin login or draft token missing |
| 403 | Admin password change required |
| 404 | Route/record not found |
| 409 | Booking conflict |
| 429 | Rate limit/OTP cooldown |

```js
const payload = await response.json();
if (!response.ok) {
  showError(payload.message || "Request failed");
  return;
}
render(payload.data);
```
