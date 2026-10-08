export const IMAGE_GROUP = {
  // welcome
  welcome: {
    remoteSigning: require("../assets/images/welcome/remoteSigning.png"),
    welcome: require("../assets/images/welcome/welcome.png"),
  },
  onBoarding: {
    register_ekyc: require("../assets/images/onBoarding/ekyc3x.png"),
    register_ncm: require("../assets/images/onBoarding/ncm3x.png"),
    Illustration1: require("../assets/images/onBoarding/img_1.png"),
    Illustration2: require("../assets/images/onBoarding/img_2.png"),
    Illustration3: require("../assets/images/onBoarding/img_3.png"),
  },
  auth: {
    verifyAccount: require("../assets/images/Signin/VerifyAccount.png"),
  },
  signup: {
    id: require("../assets/images/Signup/ID.png"),
    passport: require("../assets/images/Signup/passport.png"),
  },
  SignModal: {
    upload: require("../assets/images/signmodal/upload.png"),
    photo: require("../assets/images/signmodal/photo.png"),
    camera: require("../assets/images/signmodal/camera.png"),
    Preview: require("../assets/images/signmodal/Preview.png"),
    EditSign: require("../assets/images/signmodal/EditSign.png"),
    DeleteSign: require("../assets/images/signmodal/DeleteSign.png"),
  },
  icon: {
    DownloadSimple: require("../assets/images/icon/DownloadSimple.png"),
    Share: require("../assets/images/icon/Share.png"),
    ShieldCheck: require("../assets/images/icon/ShieldCheck.png"),
    IdentificationCard: require("../assets/images/icon/IdentificationCard.png"),
    IdentificationCard_2: require("../assets/images/icon/IdentificationCard_2.png"),
    MapPin: require("../assets/images/icon/MapPin.png"),
    Notebook: require("../assets/images/icon/Notebook.png"),
    CalendarBlank: require("../assets/images/icon/CalendarBlank.png"),
    PhoneCall: require("../assets/images/icon/PhoneCall.png"),
    NoteCheck: require("../assets/images/icon/NoteCheck.png"),
    FingerprintSimple: require("../assets/images/icon/FingerprintSimple.png"),
    GlobeSimple: require("../assets/images/icon/GlobeSimple.png"),
    Headphones: require("../assets/images/icon/Headphones.png"),
    Info: require("../assets/images/icon/Info.png"),
    LockKey: require("../assets/images/icon/LockKey.png"),
    PencilCircle: require("../assets/images/icon/PencilCircle.png"),
    PencilSimple: require("../assets/images/icon/PencilSimple.png"),
    Shopping_Basket: require("../assets/images/icon/Shopping_Basket.png"),
    Notepad: require("../assets/images/icon/Notepad.png"),
    House: require("../assets/images/icon/House.png"),
    UploadSimple: require("../assets/images/icon/UploadSimple.png"),
    FaceID: require("../assets/images/icon/FaceID.png"),
    Eye: require("../assets/images/icon/Eye.png"),
    EyeClosed: require("../assets/images/icon/EyeClosed.png"),
    Bell: require("../assets/images/icon/Bell.png"),
    ArrowClockwise: require("../assets/images/icon/ArrowClockwise.png"),
    LinkBreak: require("../assets/images/icon/LinkBreak.png"),
  },
  home: {
    banner: require("../assets/images/home/banner.png"),
    waitingCTS: require("../assets/images/home/waitingCTS.png"),
  },
  document: {
    sign_success: require("../assets/images/document/sign_success.png"),
    // signature: require("../assets/images/optional/signature.png"),
    // frame: require("../assets/images/optional/Frame.png"),
    Info: require("../assets/images/document/InfoDocument.png"),
    Sign: require("../assets/images/document/SignDocument.png"),
  },
  account: {
    avatar: require("../assets/images/account/Group_26861.png"),
    Review: require("../assets/images/account/Review.png"),
    Lovely: require("../assets/images/account/Lovely.png"),
  },
  language: {
    vi: require("../assets/images/language/vi.png"),
    en: require("../assets/images/language/en.png"),
  },
  auth: {
    verifyAccount: require("../assets/images/Signin/VerifyAccount.png"),
    finish: require("../assets/images/Signup/finish.png"),
  },
};

export const RouterG = {
  RegInfo: "RegInfo",
  Scan: "Scan",
  ScanMRZ: "ScanMRZ",
  Dangky: "Dangky",
};

export const INFOMATION_FIELD = [
  {
    name: "hoten",
    label: "Họ và tên",
    required: true,
    type: "string",
    i18n: "register1text2",
  },
  {
    name: "email",
    label: "Email",
    required: true,
    type: "string",
    i18n: "ctstext5",
  },
  {
    name: "diachi",
    label: "Địa chỉ",
    required: false,
    type: "string",
    i18n: "register1text3",
  },
  {
    name: "tinhtp",
    label: "Chọn tỉnh/Thành phố",
    required: true,
    type: "string",
    i18n: "register1text4",
  },
  {
    name: "cmnd",
    label: "Số CMND/CCCD/Hộ chiếu",
    required: true,
    type: "string",
    i18n: "register1text5",
  },
  {
    name: "ngaycap",
    label: "Ngày cấp",
    required: true,
    type: "date",
    i18n: "register1text6",
  },
  {
    name: "noicap",
    label: "Nơi cấp",
    required: true,
    type: "string",
    i18n: "register1text7",
  },
];

export const INFOMATION_DEVICE_FIELD = [
  {
    name: "tenmay",
    label: "Tên máy",
    required: true,
    type: "string",
    i18n: "register1text9",
    disabled: true,
  },
  {
    name: "loaimay",
    label: "Loại máy",
    required: true,
    type: "string",
    i18n: "register1text10",
    disabled: true,
  },
  {
    name: "hedieuhanh",
    label: "Hệ điều hành",
    required: true,
    type: "string",
    i18n: "register1text11",
    disabled: true,
  },
  {
    name: "phienban",
    label: "Phiên bản",
    required: true,
    type: "string",
    i18n: "register1text12",
    disabled: true,
  },
  {
    name: "uuid",
    label: "Mã UUID",
    required: true,
    type: "string",
    i18n: "register1text13",
    disabled: true,
  },
];

export const INFOMATION_CONTACT_FIELD = [
  {
    name: "hoten",
    label: "Họ tên người liên hệ",
    required: true,
    type: "string",
    i18n: "register1text15",
  },
  {
    name: "dienthoai",
    label: "Số điện thoại",
    required: true,
    type: "string",
    i18n: "register1text16",
  },
  {
    name: "diachi",
    label: "Địa chỉ",
    required: true,
    type: "string",
    i18n: "register1text3",
  },
  {
    name: "makd",
    label: "Mã nhân viên",
    required: true,
    type: "string",
    i18n: "register1text22",
  },
];

export const DOCUMENT_TYPE_SINGLE = "1";
export const DOCUMENT_TYPE_MULTIPLE = "2";
export const DOCUMENT_TYPE_SYSTEM = "3";
export const CHUA_KY = 0;
export const DA_KY = 1;
export const TU_CHOI_KY = 2;
export const TYPE_SAI = -1;
export const DAU_VAO_KY_SAI = -2;
export const DA_XOA_YEU_CAU_KY = 7;
export 
const chslop = 30;
const smallSlop = 12;
export const hitSlop = {
  top: chslop,
  right: chslop,
  bottom: chslop,
  left: chslop,
};
export const hitSlopSmall = {
  top: smallSlop,
  right: smallSlop,
  bottom: smallSlop,
  left: smallSlop,
};
