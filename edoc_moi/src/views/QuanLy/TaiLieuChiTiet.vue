<template>
  <a-spin :spinning="isLoading">
    <a-page-header
      :title="thongtinVB.TenVBGoc"
      @back="() => $router.go(-1)"
      class="!bg-white"
    >
      <template #extra>
        <div class="flex justify-end gap-4 p-2 items-center">
          <template v-if="laTaiKhoanKy">
            <a-button
              class="w-[140px] h-[36px] border rounded-md bg-white text-[#1E1E1E]"
              @click="openDialogTuchoiVB"
              >Từ chối</a-button
            >
            <a-button
              class="w-[140px] h-[36px] border rounded-md bg-white text-[#0055E6] border-[#0055E6]"
              @click="openKyVneId"
              >Ký VNeID</a-button
            >
            <a-button
              class="w-[140px] h-[36px] border rounded-md bg-[#0055E6] text-white"
              @click="kyTaiLieu"
              >Ký tài liệu</a-button
            >
          </template>
          <template v-else-if="!laTaiKhoanKy">
            <!-- <a-button class="w-[140px] h-[30px] bg-white text-[#1E1E1E]">
            <div class="flex items-center justify-center space-x-2">
              <span>
                <CloudDownloadOutlined />
              </span>
              <span>Tải xuống</span>
            </div>
          </a-button> -->
          </template>
          <!-- <div class="relative">
            <Popover v-slot="{ open }" class="relative">
              <PopoverButton
                :class="open ? 'text-white' : 'text-white/90'"
                class="group inline-flex items-center rounded-md px-3 py-2 text-base font-medium hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
              >
                <MoreVertIcon></MoreVertIcon>
              </PopoverButton>

              <transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="translate-y-1 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="translate-y-1 opacity-0"
              >
                <PopoverPanel
                  class="absolute left-1/2 z-10 mt-3 w-screen max-w-sm -translate-x-1/2 transform px-4 sm:px-0"
                >
                  <div
                    class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5"
                  >
                    <div
                      class="relative grid gap-1 bg-white p-7 lg:grid-cols-1"
                    >
                      <button
                        v-for="item in actions"
                        :key="item.name"
                        @click="item.click()"
                        class="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500/50"
                      >
                        <div
                          class="flex h-10 w-10 shrink-0 items-center justify-center text-white"
                        >
                          <div v-html="item.icon"></div>
                        </div>
                        <div class="ml-4">
                          <p class="text-sm font-medium text-gray-900">
                            {{ item.name }}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </PopoverPanel>
              </transition>
            </Popover>
          </div> -->
        </div>
      </template>
    </a-page-header>
    <a-tabs v-model:activeKey="activeKey" class="w-full">
      <a-tab-pane key="1" tab="Nội dung">
        <div class="font-nunito">
          <div
            class="flex divide-x justify-center items-center w-full h-[32px] text-[14px] font-nunito leading-5 font-semibold"
          >
            <div class="flex w-[250px]">
              <div>Trạng thái:&nbsp;</div>
              <div class="text" :class="statusColor">{{ getStatusName() }}</div>
            </div>
            <div class="w-[250px] flex justify-center">
              Người gửi:&nbsp;{{ thongtinVB.Hotennguoitao }}
            </div>
            <div class="w-[250px] flex justify-center">
              Cập nhật:&nbsp;{{
                dayjs(thongtinVB.thoigiangui).format("DD-MM-YYYY HH:mm:ss")
              }}
            </div>
            <div class="w-[250px] flex justify-center">
              Mã tài liệu:&nbsp;{{ thongtinVB.idFile }}
            </div>
          </div>
          <div class="">
            <div
              class="flex items-center justify-center divide-x-4 h-[40px] bg-[#E7ECEF] gap-6"
            >
              <div class="flex items-center justify-center gap-4">
                <a-button
                  @click="scaleDown"
                  shape="circle"
                  :size="'small'"
                  class="flex items-center justify-center"
                >
                  <MinusOutlined />
                </a-button>
                <div>{{ scale * 100 }}%</div>
                <a-button
                  @click="scaleUp"
                  shape="circle"
                  :size="'small'"
                  class="flex items-center justify-center"
                >
                  <PlusOutlined />
                </a-button>
              </div>
              <div class="flex gap-2">
                <a-button
                  @click="backTrangky"
                  shape="circle"
                  :size="'small'"
                  class="flex items-center justify-center"
                >
                  <LeftOutlined />
                </a-button>
                <span>Trang {{ Trangky }} / Tổng {{ totalPage }} trang</span>
                <a-button
                  @click="nextTrangky"
                  shape="circle"
                  :size="'small'"
                  class="flex items-center justify-center"
                >
                  <RightOutlined />
                </a-button>
              </div>
              <div class="flex gap-4">
                <!-- <HandIcon />
            <PrintIcon /> -->
              </div>
            </div>
            <div class="flex flex-col items-center">
              <div>
                <canvas ref="pdfCanvas" style="display: none"></canvas>
                <v-stage ref="stageRef" :config="stageConfig" class="z-50">
                  <v-layer>
                    <v-image :image="image" />

                    <v-rect
                      v-if="rec"
                      :x="rec.x"
                      :y="rec.y"
                      :width="rec.width"
                      :height="rec.height"
                      fill="rgba(0, 0, 255, 0.3)"
                    />
                  </v-layer>
                </v-stage>
              </div>
            </div>
          </div>
        </div>
        <a-modal
          v-model:open="modalVerify"
          :title="'Thông tin chi tiết'"
          centered
          class="!w-[556px] !font-nunito !text-[14px] !leading-5 font-semibold"
        >
          <template #footer> </template>
          <a-divider />
          <div
            class="grid grid-col-1 gap-[16px] content-start w-full text-[#1E1E1E] font-nunito"
          >
            <div class="w-full border rounded-lg" v-for="i in 3">
              <div class="w-full rounded-2xl bg-white items-center divide-y">
                <div class="flex justify-between items-center p-4">
                  <div>
                    <div class="font-semibold">1 - Nguyễn Thu Hồng</div>
                    <div
                      class="font-nunito text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]"
                    >
                      TSA: 27/03/2023 15:15:49
                    </div>
                  </div>
                  <div
                    class="flex gap-1 items-center text-[#21C75E] text-[12px] font-normal"
                  >
                    <CheckCircleOutlineIcon />
                    Hoàn tất
                  </div>
                </div>
                <Disclosure v-slot="{ open }">
                  <DisclosureButton
                    class="flex w-full justify-between rounded-lg px-4 py-2 text-left text-sm font-medium"
                  >
                    <span
                      >Thông tin chứng thư số -
                      <span class="text-[#21C75E]">Hợp lệ</span></span
                    >
                    <ChevronUpIcon
                      :class="open ? 'rotate-180 transform' : ''"
                      class="h-5 w-5"
                    />
                  </DisclosureButton>
                  <DisclosurePanel class="px-4 pb-2 pt-4 text-sm text-gray-500">
                    <div class="grid grid-cols-3 gap-2">
                      <div
                        class="text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]"
                      >
                        Tên chứng thư
                      </div>
                      <div class="col-span-2">Hoàng Quốc Khanh</div>
                      <div
                        class="text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]"
                      >
                        CMND
                      </div>
                      <div class="col-span-2">0123456789</div>
                      <div
                        class="text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]"
                      >
                        Tên chứng thư
                      </div>
                      <div class="col-span-2">CA2 RS - NACENCOMM JSC</div>
                      <div
                        class="text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]"
                      >
                        Số Serial
                      </div>
                      <div class="col-span-2">123U-ĐN-ASN-R21-3849-012-858</div>
                      <div
                        class="text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]"
                      >
                        Thời gian hiệu lực
                      </div>
                      <div class="col-span-2">
                        Thời gian hiệu lực Từ 21/04/2022 15:55:18 đến 21/04/2026
                        16:05:00
                      </div>
                      <div
                        class="text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]"
                      >
                        Chi tiết chứng thư
                      </div>
                      <div class="col-span-2">
                        Chi tiết chứng thư E= chrishoang90@gmail.com
                        UID=CMND:0123456789CN=Hoàng Quốc Khanh L=Tầng 3, 16 Sông
                        Thao, Phường 2, Quận Tân Bình, Tp. Hồ Chí Minh S=Hà nội
                        C=VN
                      </div>
                    </div>
                  </DisclosurePanel>
                </Disclosure>
              </div>
            </div>
          </div>
        </a-modal>
        <a-modal
          v-model:open="modalShareFile"
          :title="'Chia sẻ tài liệu'"
          centered
          class="!w-[556px] h-[480px] !font-nunito !text-[14px] !leading-5 font-semibold"
        >
          <template #footer>
            <a-button
              key="back"
              @click="handleCancelShareFile"
              class="w-[140px] h-[36px] text-[#1E1E1E]"
              >Hủy</a-button
            >
            <a-button
              key="submit"
              type="primary"
              @click="handleOkShareFile"
              class="w-[140px] h-[36px] bg-[#0055E6] text-white"
              >Xác nhận</a-button
            >
          </template>
          <a-divider />
          <div
            class="grid grid-col-1 gap-[16px] content-start w-full text-[#1E1E1E] font-nunito h-[400px]"
          >
            <BaseInputForm
              :label="'Tài liệu'"
              :type="'text'"
              :placeholder="'Tài liệu'"
              v-model="thongtinVB.name"
              :style="'w-full'"
              :readonly="'readonly'"
            ></BaseInputForm>
            <div>
              <label
                class="font-nunito text-[13px] leading-[20px] mb-1 font-semibold text-[#1E1E1E]"
                >Người nhận</label
              >
              <a-select
                ref="select"
                v-model:value="formDataContact.contactId"
                :options="listContact"
                :placeholder="'Chọn từ danh bạ'"
                class="custom-select w-full"
              >
              </a-select>
            </div>
            <template v-if="showOtherInput">
              <BaseInputForm
                :label="'Email'"
                :type="'text'"
                :placeholder="'Nhập email'"
                v-model="formDataContact.email"
                :style="'w-full'"
              ></BaseInputForm>
            </template>
          </div>
        </a-modal>
        <a-modal
          v-model:open="modalVneId"
          :title="'Chọn chứng thư số VNeID'"
          centered
          class="!w-[556px] !font-nunito !text-[14px] !leading-5 font-semibold"
        >
          <template #footer>
            <a-button
              key="back"
              @click="modalVneId = false"
              class="w-[140px] h-[36px] text-[#1E1E1E]"
              >Hủy</a-button
            >
            <a-button
              key="submit"
              type="primary"
              :disabled="!selectedVneIdCert"
              @click="kyTaiLieu_VneId"
              class="w-[140px] h-[36px] bg-[#0055E6] text-white"
              >Ký</a-button
            >
          </template>
          <a-divider />
          <div class="font-nunito text-[#1E1E1E]">
            <p v-if="vneidCccd" class="text-[13px] leading-[20px] font-normal text-[#7C7C7E] mb-3">
              CCCD: {{ vneidCccd }}
            </p>
            <p v-if="vneidListLoading" class="text-[13px] font-normal text-[#7C7C7E]">
              Đang lấy danh sách chứng thư...
            </p>
            <div
              v-else-if="vneidListError"
              class="rounded-lg border border-[#F5C2C2] bg-[#FFF5F5] px-4 py-3 text-[13px] font-normal leading-5 text-[#C62828]"
            >
              {{ vneidListError }}
            </div>
            <div v-else-if="vneidCerts.length === 0" class="text-[13px] font-normal text-[#7C7C7E]">
              Không có chứng thư đang hoạt động.
            </div>
            <div v-else class="grid grid-cols-1 gap-4 max-h-[420px] overflow-auto">
              <button
                v-for="item in vneidCerts"
                :key="item.credentialID"
                type="button"
                class="w-full border rounded-lg bg-white text-left"
                :class="selectedVneIdId === item.credentialID ? 'border-[#0055E6]' : 'border-[#E6E6E8]'"
                @click="selectedVneIdId = item.credentialID"
              >
                <div class="flex justify-between items-center p-4">
                  <div>
                    <div class="font-semibold">{{ item.cert.subjectDN || item.cert.serialNumber }}</div>
                    <div class="font-nunito text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]">
                      {{ item.cert.provider || "VNeID" }}
                    </div>
                  </div>
                  <div class="flex gap-1 items-center text-[#21C75E] text-[12px] font-normal">
                    <CheckCircleOutlineIcon />
                    {{ item.cert.status === 1 ? "Hợp lệ" : "Chứng thư" }}
                  </div>
                </div>
                <div class="px-4 pb-4">
                  <div class="grid grid-cols-3 gap-2 text-sm">
                    <div class="text-[13px] leading-[20px] font-normal text-[#7C7C7E]">Số Serial</div>
                    <div class="col-span-2 break-all">{{ item.cert.serialNumber || item.credentialID }}</div>
                    <div class="text-[13px] leading-[20px] font-normal text-[#7C7C7E]">Nhà phát hành</div>
                    <div class="col-span-2">{{ item.cert.issuerDN || "—" }}</div>
                    <div class="text-[13px] leading-[20px] font-normal text-[#7C7C7E]">Thời gian hiệu lực</div>
                    <div class="col-span-2">Từ {{ item.cert.validFrom || "—" }} đến {{ item.cert.validTo || "—" }}</div>
                    <div class="text-[13px] leading-[20px] font-normal text-[#7C7C7E]">Chi tiết chứng thư</div>
                    <div class="col-span-2 break-all">{{ item.cert.subjectDN || "—" }}</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </a-modal>
      </a-tab-pane>
      <a-tab-pane key="2" tab="Lịch sử hoạt động">
        <h3 class="font-bold leading-[20px]">THÔNG TIN CHI TIẾT</h3>
        <div
          class="grid grid-cols-3 gap-2 flex w-full justify-between rounded-lg px-4 py-2 text-left text-sm font-medium"
        >
          <div
            class="text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]"
          >
            Mã văn bản
          </div>
          <div class="col-span-2">#{{ thongtinVB.idFile }}</div>
          <div
            class="text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]"
          >
            Tên văn bản
          </div>
          <div class="col-span-2">{{ thongtinVB.TenVBGoc }}</div>
          <div
            class="text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]"
          >
            Người tạo văn bản
          </div>
          <div class="col-span-2">
            {{ thongtinVB.Taikhoantao }} - {{ thongtinVB.Hotennguoitao }}
          </div>
          <div
            class="text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]"
          >
            Thời gian tạo văn bản
          </div>
          <div class="col-span-2">
            {{ dayjs(thongtinVB.Ngaytao).format("DD/MM/YYYY HH:mm:ss") }}
          </div>
          <div
            class="text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]"
          >
            Trạng thái văn bản
          </div>
          <div class="col-span-2">
            {{ getStatusName() }}
          </div>
          <div
            class="text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]"
          >
            Người nhận và ký văn bản
          </div>
          <div class="col-span-2">
            <a-table
              :columns="columnsTTVB"
              :data-source="thongtinVBArray"
              :pagination="false"
            >
            </a-table>
          </div>
        </div>
        <a-divider />
        <h3 class="font-bold leading-[20px] pb-2">LỊCH SỬ HOẠT ĐỘNG</h3>
        <a-table
          :columns="columnsLichSu"
          :data-source="logVB"
          :pagination="false"
        >
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </a-spin>
  <a-modal
    v-model:open="modalTuchoiVB"
    :title="'Từ chối văn bản'"
    centered
    class="!w-[556px] h-[480px] !font-nunito !text-[14px] !leading-5 font-semibold"
  >
    <template #footer>
      <a-button
        key="back"
        @click="handleHuyTuchoiVB"
        class="w-[140px] h-[36px] text-[#1E1E1E]"
        >Hủy</a-button
      >
      <a-button
        key="submit"
        type="primary"
        @click="handleOkTuchoiVB"
        class="w-[140px] h-[36px] bg-[#0055E6] text-white"
        >Xác nhận</a-button
      >
    </template>
    <a-divider />
    <div
      class="grid grid-col-1 gap-[16px] content-start w-full text-[#1E1E1E] font-nunito h-[400px]"
    >
      <a-textarea
        v-model:value="Lydotuchoi"
        placeholder="Nhập lý do từ chối"
        :auto-size="{ minRows: 3, maxRows: 5 }"
      />
    </div>
  </a-modal>
  <a-modal
    v-model:open="modalUploadAnhChuKy"
    :title="'Chọn Ảnh Chữ Ký'"
    centered
    @cancel="handleHuyUploadAnhChuKy"
    class="!font-nunito !text-[14px] !leading-5 font-semibold"
  >
    <template #footer>
      <a-button
        key="back"
        @click="handleHuyUploadAnhChuKy"
        class="w-[140px] h-[36px] text-[#1E1E1E]"
        >Hủy</a-button
      >
      <a-button
        key="submit"
        type="primary"
        @click="handleOkUpLoadAnhChuKy"
        class="w-[140px] h-[36px] bg-[#0055E6] text-white"
        >Xác nhận</a-button
      >
    </template>

    <a-tabs
      v-model:activeKey="activeKeySignModal"
      centered
      class="min-h-[400px]"
    >
      <a-tab-pane key="1" tab="Ảnh"
        ><div
          class="grid grid-col-1 gap-[16px] content-start w-full text-[#1E1E1E] font-nunito mt-4"
        >
          <a-spin :spinning="isLoading">
            <a-upload-dragger
              name="file"
              :file-list="fileList"
              :max-count="1"
              :accept="listFileType.join(', ')"
              :beforeUpload="beforeUpload"
              @change="handleChange"
              @drop="handleDrop"
              class=""
            >
              <div class="flex items-center justify-center h-full">
                <div class="grid grid-cols-1 content-center justify-center">
                  <p class="ant-upload-drag-icon flex justify-center">
                    <UploadFileIcon />
                  </p>
                  <div
                    class="ant-upload-text flex gap-3 items-center justify-center"
                  >
                    <a-button
                      key="submit"
                      type="primary"
                      @click=""
                      class="w-[140px] h-[36px] bg-[#0055E6] text-white"
                      >Tải lên từ thiết bị
                    </a-button>
                  </div>
                  <p class="ant-upload-hint">
                    Định dạng được hỗ trợ: png, jpeg, jpg
                  </p>
                </div>
              </div>
            </a-upload-dragger>
          </a-spin>
        </div></a-tab-pane
      >
      <a-tab-pane key="2" tab="Vẽ" force-render>
        <div
          class="grid grid-col-1 gap-[16px] content-start w-full text-[#1E1E1E] font-nunito mt-4 mb-4"
        >
          <div
            class="border-dashed border-2 rounded-lg width-[472px] overflow-hidden"
          >
            <CustomSignature
              ref="signaturePad1"
              :is-trim-canvas="true"
              download-name="Signature"
            ></CustomSignature>
          </div>
          <div class="flex items-center">
            <p class="w-[40px]">Màu:</p>
            <div class="flex-1 flex items-center">
              <div
                v-for="color in colorOptions"
                :class="`flex items-center justify-center relative justify-center w-[30px] h-[30px] mr-[10px] rounded-full cursor-pointer border-2 ${
                  color.value === colorRef ? `border-[${color.value}]` : ''
                } `"
                :style="{
                  backgroundColor:
                    color.value === colorRef ? '#fff' : color.value,
                }"
                @click="handleChangeColor(color.value)"
              >
                <div
                  :class="`absolute w-[20px] h-[20px] rounded-full`"
                  :style="{
                    backgroundColor: color.value,
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="3" tab="Văn bản">
        <div
          class="grid grid-col-1 gap-[16px] content-start w-full text-[#1E1E1E] font-nunito mt-4"
        >
          <a-form ref="formRef" :layout="'vertical'" :class="''">
            <a-form-item label="Nhập nội dung muốn hiển thị" name="">
              <a-input
                v-model="textSignature"
                placeholder="..."
                :class="'w-full'"
                v-on:keydown="
                  (e: any) => {
                    const value = e.target.value;
                    if (
                      value.length >= 15 &&
                      e.key !== 'Backspace' &&
                      e.key !== 'Delete' &&
                      e.key !== 'ArrowLeft' &&
                      e.key !== 'ArrowRight'
                    ) {
                      return e.preventDefault();
                    }
                  }
                "
                v-on:change="
                  (e :any) => {
                    textSignature = e.target.value || '';
                  }
                "
              />
            </a-form-item>
            <a-form-item
              :class="`h-[200px] max-h-[200px] overflow-y-auto`"
              v-if="!isEmpty(textSignature)"
            >
              <a-radio-group
                v-model:value="signatureRadioValue"
                class="divide-y w-full"
              >
                <div
                  v-for="(font, i) in fonts"
                  :key="i"
                  :style="{}"
                  :class="`flex items-center w-full justify-between p-2 text-[20px]`"
                >
                  <a-radio
                    :style="{
                      display: 'flex',
                      height: '30px',
                      lineHeight: '30px',
                      fontFamily: font.value,
                      fontSize: '20px',
                    }"
                    :class="`detail-docs__radio`"
                    :value="font.value"
                    >{{ textSignature }}</a-radio
                  >
                </div>
              </a-radio-group>
            </a-form-item>
          </a-form>
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>
<script setup lang="ts">
import {
  PlusOutlined,
  MinusOutlined,
  LeftOutlined,
  RightOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons-vue";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { ChevronUpIcon } from "@heroicons/vue/20/solid";
import CheckCircleOutlineIcon from "@/assets/img/check_circle_outline.svg?component";
import TextSniperIcon from "@/assets/img/text_sniper.svg?component";
import HandIcon from "@/assets/img/hand.svg?component";
import PrintIcon from "@/assets/img/print.svg?component";
import UploadFileIcon from "@/assets/img/upload_file.svg?component";
import { pdfjsLib } from "@/utils/pdfjsSetup";

import MoreVertIcon from "@/assets/img/more_vert.svg?component";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { Storage } from "@/utils/Storage";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import CustomSignature from "@/components/Signature/CustomSignature.vue";

const imgRef = ref("");

const router = useRouter();
const route = useRoute();
const isLoading = ref(false);
const idFile = ref();
const idthietlap = ref();
const email = ref();
email.value = Storage.get("Email");
import * as x509 from "@peculiar/x509";
import { UnwrapRef } from "vue";
import dayjs from "dayjs";
import { Upload, UploadChangeParam, message, Modal } from "ant-design-vue";
import { convertXmlToJson, getDataFromXml } from "@/utils/common";
import { getAccountInfor } from "@/api/account";
import { find, isArray, isEmpty, now } from "lodash-es";
import { fonts } from "@/utils/constants";
import { textToImage } from "@/utils/common";
import { getFileUrl, getPublicFileUrl } from "@/utils/fileStorage";
email.value = Storage.get("Email");
const columnsTTVB = [
  {
    title: "Trình tự ký",
    dataIndex: "trinhtuky",
    key: "trinhtuky",
  },
  {
    title: "Họ tên",
    dataIndex: "Hotennguoiky",
    key: "Hotennguoiky",
  },
  {
    title: "Tài khoản",
    dataIndex: "taikhoanky",
    key: "taikhoanky",
  },
  {
    title: "Hình thức ký",
    dataIndex: "hinhthucky",
    key: "hinhthucky",
    customRender: ({ record }: { record: any }) => {
      return getHinhThucKyName(record.hinhthucky);
    },
  },
];
const columnsLichSu = [
  {
    title: "Thao tác",
    dataIndex: "Noidung",
    key: "Noidung",
  },
  {
    title: "Thời gian thực hiện",
    dataIndex: "Thoigian",
    key: "Thoigian",
    customRender: ({ record }: { record: any }) => {
      return dayjs(record.Thoigian).format("DD/MM/YYYY HH:mm:ss");
    },
  },
  {
    title: "Tài khoản thực hiện",
    dataIndex: "Taikhoanthuchien",
    key: "Taikhoanthuchien",
  },
  {
    title: "Tên người thực hiện",
    dataIndex: "Hoten",
    key: "Hoten",
  },
];
const laTaiKhoanKy = ref(false);

const activeKey = ref("1");
const activeKeySignModal = ref("1");
const rec = ref<any>();
const thongtinthietlapky_hash = reactive<any>({});
const thongtinVB = reactive<any>({});
const thongtinVBArray = ref();
const logVB = ref<any>();
const thongtinchukyso: UnwrapRef<any> = reactive({
  Email: "",
  IDCTS: "",
  Serialno: "",
  NgayHetHanChungThuSo: "",
  cert: "",
  Phuongthucky: "",
});
const signatureRef = ref<any>(null);
const colorOptions = ref<{ value: string; label: string }[]>([
  {
    value: "#000000",
    label: "black",
  },
  {
    value: "#FF0000",
    label: "red",
  },
  {
    value: "#0055e6",
    label: "blue",
  },
]);
const colorRef = ref<string>(colorOptions.value[0].value);
const textSignature = ref<string>("");
const signatureRadioValue = ref(fonts[0].value);
const signaturePad1 = ref<InstanceType<typeof CustomSignature>>();
const canvasDataURL1 = ref("");

const Laythietlapphuongthuckysomacdinh = async () => {
  // URL của API server SOAP
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  // Envelope của SOAP request
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Laythietlapphuongthuckysomacdinh xmlns="http://tempuri.org/">
          <Email>${email.value}</Email>
        </Laythietlapphuongthuckysomacdinh>
      </soap12:Body>
    </soap12:Envelope>
     `;

  // Thực hiện request SOAP sử dụng axios
  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: {
      "Content-Type": "application/soap+xml;charset=UTF-8",
    },
  });

  // Lấy dữ liệu từ phản hồi SOAP
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "text/xml");
  thongtinchukyso.email = getDataFromXml(xmlDoc, "Email");
  thongtinchukyso.IDCTS = getDataFromXml(xmlDoc, "IDCTS");
  thongtinchukyso.Serialno = getDataFromXml(xmlDoc, "Serialno");
  thongtinchukyso.Phuongthucky = getDataFromXml(xmlDoc, "Phuongthucky");
};
const setVungKy = () => {
  const infoStr = thongtinthietlapky_hash.Info;
  // Chia chuỗi thành mảng các phần tử dựa trên khoảng trắng
  let numberArray = infoStr.split(" ");

  console.log(numberArray);
  console.log("stageConfig", stageConfig);

  // Chuyển đổi mỗi phần tử thành số
  numberArray = numberArray.map(Number);
  rec.value = {
    x: numberArray[0],
    y: stageConfig.height - numberArray[1],
    width: numberArray[2] - numberArray[0],
    height: numberArray[1] - numberArray[3],
  };

  console.log(rec.value);
  Trangky.value = numberArray[4];
};
const Laythongtinthietlapky_hash = async () => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Laythongtinthietlapky_hash xmlns="http://tempuri.org/">
          <idFile>${idFile.value}</idFile>
          <Taikhoanky>${email.value}</Taikhoanky>
          <trinhtuky>${thongtinVB.trinhtuky}</trinhtuky>
        </Laythongtinthietlapky_hash>
      </soap12:Body>
    </soap12:Envelope>
     `;

    // Thực hiện request SOAP sử dụng axios
    const response = await axios.post(apiUrl, soapEnvelope, {
      headers: {
        "Content-Type": "application/soap+xml;charset=UTF-8",
      },
    });

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "text/xml");
    thongtinthietlapky_hash.Vitriluu = getDataFromXml(xmlDoc, "Vitriluu");
    thongtinthietlapky_hash.Email = getDataFromXml(xmlDoc, "Email");
    thongtinthietlapky_hash.Info = getDataFromXml(xmlDoc, "Info");
    setVungKy();
    thongtinthietlapky_hash.Keyhethong = getDataFromXml(xmlDoc, "Keyhethong");
    thongtinthietlapky_hash.Singnaturefield = getDataFromXml(
      xmlDoc,
      "Singnaturefield"
    );
    thongtinthietlapky_hash.Trangky = getDataFromXml(xmlDoc, "Trangky");
    thongtinthietlapky_hash.Hinhthucky = Number(
      getDataFromXml(xmlDoc, "Hinhthucky")
    );
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const Xoayeucauky_Keyhethong = async () => {
  const apiUrl =
    "https://apisign.nacencomm.vn/api/APISigncore/Xoayeucauky_Keyhethong?Keyhethong=" +
    thongtinthietlapky_hash.Keyhethong;
  // Thực hiện request SOAP sử dụng axios
  await axios.post(apiUrl, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
const ketquaTuHashFile = reactive<any>({
  idfile: "58145",
  tempfile:
    "E:\\PUBLIC_cuong\\PUBLIC//temp//58145_$trungtranthanh.k56@gmail.com_4046488f18284e04a6c2295c921e3833.pdf",
  strhash:
    "MUswGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAvBgkqhkiG9w0BCQQxIgQgfCNHnuJCtDPpQE7x2O+YFbdKjhLkETsvgcjiLwI28hU=",
});
const HashFile = async () => {
  const infoStr = thongtinthietlapky_hash.Info;
  // Chia chuỗi thành mảng các phần tử dựa trên khoảng trắng
  let numberArray = infoStr.split(" ");

  // Chuyển đổi mỗi phần tử thành số
  numberArray = numberArray.map(Number);
  const apiUrl = `${import.meta.env.VITE_APP_BASE_URL_API || "https://apiuploadedoc.nacencomm.vn"}/api/data/HashPDFFile?idfile=${idFile.value}&taikhoanky=$${email.value}&serial=${thongtinchukyso.Serialno}&sourcepath=${thongtinVB.VitriluuBandau}&pagesign=${numberArray[4]}&itext_x1=${numberArray[0]}&itext_y1=${numberArray[1]}&itext_x2=${numberArray[2]}&itext_y2=${numberArray[3]}&signaturefield=${thongtinthietlapky_hash.Singnaturefield}`;
  // Thực hiện request SOAP sử dụng axios
  const response = await axios.post(apiUrl, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.data) {
    Object.assign(ketquaTuHashFile, JSON.parse(response.data));
  }
};
const CodeTuGuiyeucauky = ref();
const GuiYeuCauKy = async () => {
  let data = {
    Serial: thongtinchukyso.Serialno,
    Cleartext: ketquaTuHashFile.strhash,
    Linkfile_goc: getPublicFileUrl(thongtinVB.Vitriluu),
    Email: thongtinthietlapky_hash.Email,
    Masothue: "1",
    Mahethong: "1",
    Type: "XML",
    Keyhethong: thongtinthietlapky_hash.Keyhethong,
  };
  // Gửi yêu cầu ký về ứng dụng và 	Check trạng thái ký trên Firebase theo mã code phiên ký
  if (thongtinthietlapky_hash.Vitriluu.endsWith("xml")) {
    data.Type = "XML";
    if (Number(thongtinchukyso.Phuongthucky) === 1) {
      const apiUrl =
        "https://apisign.nacencomm.vn/api/APISigncore/Guiyeucauky_Mobilesign";
      // Thực hiện request SOAP sử dụng axios
      const response = await axios.post(apiUrl, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      CodeTuGuiyeucauky.value = response.data;
    } else if (Number(thongtinchukyso.Phuongthucky) === 2) {
      const apiUrl =
        "https://apisign.nacencomm.vn/api/APISigncore/Guiyeucauky_Token";
      // Thực hiện request SOAP sử dụng axios
      const response = await axios.post(apiUrl, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      CodeTuGuiyeucauky.value = response.data;
    }
    // Trả về chuỗi dữ liệu file XML đã ký  Check valid Base64 Save lại file đã ký theo đường dẫn vị trí lưu file ban đầu
  } else if (thongtinthietlapky_hash.Vitriluu.endsWith("pdf")) {
    data.Type = "PDF";
    if (Number(thongtinchukyso.Phuongthucky) === 1) {
      const apiUrl =
        "https://apisign.nacencomm.vn/api/APISigncore/Guiyeucauky_Mobilesign";
      // Thực hiện request SOAP sử dụng axios
      const response = await axios.post(apiUrl, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      CodeTuGuiyeucauky.value = response.data;
    } else if (Number(thongtinchukyso.Phuongthucky) === 2) {
      const apiUrl =
        "https://apisign.nacencomm.vn/api/APISigncore/Guiyeucauky_Token";
      // Thực hiện request SOAP sử dụng axios
      const response = await axios.post(apiUrl, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      CodeTuGuiyeucauky.value = response.data;
    }
  }
};
const ketquaKy = ref();
const maxTimeInSeconds = 300; // Thời gian tối đa là 5 phút (300 giây)
const LayKetquakyWithRetry = async () => {
  const startTime = new Date().getTime();

  while (true) {
    try {
      const response = await LayKetquaky();

      if (response.data && response.data.length > 0) {
        console.log("API Response:", response.data);
        ketquaKy.value = response.data;
        return;
      }

      const elapsedTimeInSeconds = (new Date().getTime() - startTime) / 1000;
      if (elapsedTimeInSeconds > maxTimeInSeconds) {
        throw new Error("Quá thời gian lấy kết quả ký!");
      }
      await delay(1000);
    } catch (error: any) {
      // Giữ nguyên lỗi timeout / thông điệp gốc, không gói thành lỗi chung
      if (
        error?.message === "Quá thời gian lấy kết quả ký!" ||
        String(error?.message || "").includes("Quá thời gian")
      ) {
        throw error;
      }
      const elapsedTimeInSeconds = (new Date().getTime() - startTime) / 1000;
      if (elapsedTimeInSeconds > maxTimeInSeconds) {
        throw new Error("Quá thời gian lấy kết quả ký!");
      }
      console.warn("LayKetquaky tạm lỗi, thử lại...", error);
      await delay(1000);
    }
  }
};
const delay = async (ms: number) => {
  // Hàm chờ giữa các lần thử nghiệm
  return new Promise((resolve) => setTimeout(resolve, ms));
};
const LayKetquaky = () => {
  return axios.post(
    "https://apisign.nacencomm.vn/api/APISigncore/Layketquaky?Code=" +
      CodeTuGuiyeucauky.value,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

const GhepCKY = async () => {
  const apiUrl = `${import.meta.env.VITE_APP_BASE_URL_API || "https://apiuploadedoc.nacencomm.vn"}/api/data/GhepCKY?rescode=${CodeTuGuiyeucauky.value}&tempfile=${ketquaTuHashFile.tempfile}&serial=${thongtinchukyso.Serialno}&sourefile=${thongtinVB.VitriluuBandau}&signaturefield=${thongtinthietlapky_hash.Singnaturefield}`;
  // Thực hiện request SOAP sử dụng axios
  const response = await axios.post(apiUrl, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response?.data;
};
const getTaiKhoanKy = () =>
  String(email.value || Storage.get("Email") || Storage.get("email") || "").trim();

const getTrinhTuKy = () => Number(thongtinVB.trinhtuky);

const KyVB = async (laKyDienTu?: boolean, phuongThucKy?: number): Promise<number> => {
  const Phuongthucky =
    phuongThucKy ?? (laKyDienTu ? 0 : thongtinchukyso.Phuongthucky);
  const taiKhoanKy = getTaiKhoanKy();
  const trinhTuKy = getTrinhTuKy();
  if (!taiKhoanKy || Number.isNaN(trinhTuKy)) {
    console.error("KyVB thiếu tham số", { taiKhoanKy, trinhTuKy, idFile: idFile.value });
    return 0;
  }
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <KyVB xmlns="http://tempuri.org/">
          <idFile>${idFile.value}</idFile>
          <Taikhoanky>${taiKhoanKy}</Taikhoanky>
          <Phuongthucky>${Phuongthucky}</Phuongthucky>
          <trinhtuky>${trinhTuKy}</trinhtuky>
        </KyVB>
      </soap12:Body>
    </soap12:Envelope>
     `;

  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: {
      "Content-Type": "application/soap+xml;charset=UTF-8",
    },
  });

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "text/xml");
  const resultNode = xmlDoc.getElementsByTagName("KyVBResult")[0];
  const resultValue = resultNode?.textContent ?? resultNode?.innerHTML ?? "0";
  const kq = Number(resultValue);
  console.log("KyVBResult", kq, { taiKhoanKy, trinhTuKy, idFile: idFile.value });
  return Number.isNaN(kq) ? 0 : kq;
};

/** KyVB > 0 = thành công; còn lại lỗi → retry tối đa 3 lần rồi báo người dùng */
const KyVBWithRetry = async (
  laKyDienTu?: boolean,
  maxRetry = 3,
  phuongThucKy?: number
): Promise<number> => {
  let lastKq = 0;
  for (let attempt = 1; attempt <= maxRetry; attempt++) {
    try {
      lastKq = await KyVB(laKyDienTu, phuongThucKy);
      if (lastKq > 0) return lastKq;
      console.warn(`KyVB lần ${attempt}/${maxRetry} thất bại, kq=${lastKq}`);
      if (attempt < maxRetry) {
        await delay(1000 * attempt);
      }
    } catch (error) {
      console.error(`KyVB lần ${attempt}/${maxRetry} lỗi mạng/exception`, error);
      lastKq = -1;
      if (attempt < maxRetry) {
        await delay(1000 * attempt);
      }
    }
  }
  return lastKq;
};
const Capnhattrangthaihoantat_Code = async (code: any) => {
  await axios.post(
    `https://apisign.nacencomm.vn/api/APISigncore/Capnhattrangthaihoantat_Code?code=${code}&trangthai=1`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
const SendMail_auto = async () => {
  const htmlData = await fetch("/template/NotificationSign.html");
  const htmlContent = await htmlData.text();
  const replacedHtmlContent = htmlContent
    .replace("{url}", `https://ca2sp.nacencomm.vn`)
    .replace("{nameSend}", email.value)
    .replace("{nameFile}", thongtinVB.TenVBGoc)
    .replace("{noidung}", "");
  // URL của API server SOAP
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  // Envelope của SOAP request
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <SendMail_auto xmlns="http://tempuri.org/">
          <idFile>${idFile.value}</idFile>
          <trinhtuky>${thongtinVB.trinhtuky}</trinhtuky>
          <body><![CDATA[${replacedHtmlContent}]]></body>
          <CCMail></CCMail>
        </SendMail_auto>
      </soap12:Body>
    </soap12:Envelope>
    `;

  // Thực hiện request SOAP sử dụng axios
  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: {
      "Content-Type": "application/soap+xml;charset=UTF-8",
    },
  });

  // Lấy dữ liệu từ phản hồi SOAP
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "text/xml");
  const resultNode = xmlDoc.getElementsByTagName("SendMail_autoResult")[0];
  const resultValue = resultNode.textContent || resultNode.innerHTML;
  // Cập nhật giá trị kết quả
  if (Number(resultValue) === 1) {
    // Todo kichhoattaikhoan
  } else {
    console.log(resultValue);
  }
  // router.push("/xac-nhan-email");
};
const SendMail_Hoantat_auto = async () => {
  // URL của API server SOAP
  const htmlData = await fetch("/template/NotificationSignAll.html");
   const htmlContent = await htmlData.text();
    const replacedHtmlContent = htmlContent
      .replace("{url}", "https://ca2sp.nacencomm.vn")
      .replace("{nameFile}", thongtinVB.TenVBGoc)
      .replace("{thoigian}", new Date().toLocaleString());
  const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
  console.log("replacedHtmlContent",replacedHtmlContent)
  // Envelope của SOAP request
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <SendMail_Hoantat_auto xmlns="http://tempuri.org/">
          <idFile>${idFile.value}</idFile>
          <tieude>Tài liệu đã được ký kết thành công</tieude>
          <Subject>CA2.SignPlatform</Subject>
          <body><![CDATA[${replacedHtmlContent}]]></body>
          <CCMail></CCMail>
        </SendMail_Hoantat_auto>
      </soap12:Body>
    </soap12:Envelope>
    `;

  // Thực hiện request SOAP sử dụng axios
  const response = await axios.post(apiUrl, soapEnvelope, {
    headers: {
      "Content-Type": "application/soap+xml;charset=UTF-8",
    },
  });

  // Lấy dữ liệu từ phản hồi SOAP
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "text/xml");
  const resultNode = xmlDoc.getElementsByTagName(
    "SendMail_Hoantat_autoResult"
  )[0];
  const resultValue = resultNode.textContent || resultNode.innerHTML;
  // Cập nhật giá trị kết quả
  if (Number(resultValue) === 1) {
  } else {
    console.log(resultValue);
    console.log("Không gửi được SendMail_Hoantat_autoResult");
  }
  // router.push("/xac-nhan-email");
};
const Laycert_Serial = async (Serialno: any) => {
  // URL của API server SOAP
  const apiUrl =
    "https://apisign.nacencomm.vn/api/APISigncore/Laycert_Serial?serial=" +
    Serialno;
  // Thực hiện request SOAP sử dụng axios
  const response: any = await axios.post(apiUrl, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: false,
  });
  // let response =
  //   "MIIFijCCBHKgAwIBAgIQVAK8XKzOZpwgIwAAAAAF6jANBgkqhkiG9w0BAQsFADA2MQswCQYDVQQGEwJWTjEWMBQGA1UECgwNTkFDRU5DT01NIFNDVDEPMA0GA1UEAwwGQ0EyIFJTMB4XDTIzMDkzMDA5MDgzOFoXDTI0MTAwNTA5MDgzOFowggEoMQswCQYDVQQGEwJWTjEfMB0GA1UECAwWVGjDoG5oIHBo4buRIEjDoCBO4buZaTEyMDAGA1UEBwwpU+G7kSAyNSBMw6ogVsSDbiBUaGnDqm0gLSBUaGFuaCBYdcOibiAtSE4xIjAgBgoJkiaJk/IsZAEBDBJNU1Q6MDEwMzkzMDI3OS05OTkxPzA9BgNVBAoMNkPDtG5nIHR5IGPhu5UgcGjhuqduIGPDtG5nIG5naOG7hyB0aOG6uyBOYWNlbmNvbW0gVGVzdDEeMBwGCSqGSIb3DQEJARYPaGFuZ2R0dEBjYXZuLnZuMT8wPQYDVQQDDDZDw7RuZyB0eSBj4buVIHBo4bqnbiBjw7RuZyBuZ2jhu4cgdGjhursgTmFjZW5jb21tIFRlc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDgLFZ46l5I6WMfqFI2zHL1+W19pGu7Hr/dohV7z47OZYJzDcaUJ+8wnMX2TNe/MIpg8udIiKJ888XBUxfmZknWlP4GFqlsvhPyWsWBnEw3NCClz2VB9R3TYJj8qh9QY4F6Xxdilgpgza9QZ91+Dz2OkQdtxH38xpX9huCsida2bCaUNAZRBcTS8bqPbcWaqozi5rkYAWWQ6tr7n5yJdYELiHwwxj56du9i0C3ddY7S+YXoN3HvAymORgzIEYzs9vtufFHvov3Yt584m7xdqXkd5UOH2DG95FVY5mkDAjERtzzsAmHX2XNaHO0a8Jp5h5sU7OlQculeFJhtSVviKDpzAgMBAAGjggGeMIIBmjAiBgNVHSUBAf8EGDAWBggrBgEFBQcDBAYKKwYBBAGCNwoDDDAdBgNVHQ4EFgQUH+ncq7mHcC56MdYA3Fz8R6sBUmgwDgYDVR0PAQH/BAQDAgXgMB8GA1UdIwQYMBaAFJNOP2ZqbMcl+srb2aniRDudU3dZMDQGA1UdHwQtMCswKaAnoCWGI2h0dHA6Ly9jYTJjcmwuY2F2bi52bi9uZXdycy9jYTIuY3JsMDsGCCsGAQUFBwEBBC8wLTArBggrBgEFBQcwAYYfaHR0cDovL29jc3Bycy5jYXZuLnZuL29jc3Avb2NzcDA9BgkrBgEEAYI3FQcEMDAuBiYrBgEEAYI3FQiBtKEjhZyKJoPpjzCE9LAsq6hagXyGyek4h4arVQIBZAIBBDAsBgkrBgEEAYI3FQoBAf8EHDAaMAoGCCsGAQUFBwMEMAwGCisGAQQBgjcKAwwwRAYJKoZIhvcNAQkPBDcwNTAOBggqhkiG9w0DAgICAIAwDgYIKoZIhvcNAwQCAgCAMAcGBSsOAwIHMAoGCCqGSIb3DQMHMA0GCSqGSIb3DQEBCwUAA4IBAQC6S3F4+LZU2d1bPm8GdzzYS2msf3JhXXQrC+qIZ3MggAI4XInkgumX7Hl3PmPXBtfI0mi+AsGoOShTJ1QgHNdyi6FNY57x/UXRKe9VyWfWdEpH7XKMlkYZgFbbcfIcMFWHQXeA7+2ALM680pFWpZMQHDt+K00iljhgPm4ODrFW6KU22xtb9dAYQrVQje1JgnLMunkVeuCNxovdGNP5x6Y/nF32LJ8wnkRNtQRIZIlCKHWacJHlHa2XoFIavGSqjW8M1q5CwEerY1SwWe4yNi8s5ulkcmNJoqpPh2ZWWO/ckCpEYHd09tyx6Lt6Euzk+/NglKdhzYB6GWfifL4Lfft+";
  // Bước 1: Chuyển đổi chuỗi base64 thành mảng byte
  const cert = new x509.X509Certificate(response.data);
  thongtinchukyso.cert = cert.subject;
  thongtinchukyso.NgayHetHanChungThuSo = dayjs(cert.notAfter);
  // Bước 2: Chuyển đổi mảng byte thành chuỗi UTF-8

  // Giờ bạn có thể sử dụng giá trị giải mã (decodedString) theo ý muốn

  // Cập nhật giá trị kết quả
};
const LayTTVB = async () => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <LayTTVB xmlns="http://tempuri.org/">
            <idFile>${idFile.value}</idFile>
          </LayTTVB>
        </soap12:Body>
      </soap12:Envelope>
     `;

    // Thực hiện request SOAP sử dụng axios
    const response = await axios.post(apiUrl, soapEnvelope, {
      headers: {
        "Content-Type": "application/soap+xml;charset=UTF-8",
      },
    });

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "text/xml");
    let dataJson = convertXmlToJson(response.data);
    let arrayData;
    const DocumentElement =
      dataJson["soap:Envelope"]["soap:Body"]["LayTTVBResponse"][
        "LayTTVBResult"
      ]["diffgr:diffgram"]["DocumentElement"];
    if (DocumentElement) {
      arrayData = DocumentElement["VB"];
    }
    if (arrayData) {
      if (isArray(arrayData)) {
        arrayData.forEach((obj: { IDThietlap: any; key: any }) => {
          obj.key = obj.IDThietlap;
        });
      } else {
        arrayData.key = arrayData.IDThietlap;
        arrayData = [arrayData];
      }
    } else {
      arrayData = [];
    }
    thongtinVBArray.value = arrayData;
    const dataVB = find(arrayData, {
      idthietlap: Number(idthietlap.value),
    });
    if (dataVB) {
      dataVB.VitriluuBandau = dataVB.Vitriluu;
      let startIndex = dataVB.Vitriluu.indexOf("\\FILELUU");
      dataVB.Vitriluu = dataVB.Vitriluu.slice(startIndex);
      Object.assign(thongtinVB, dataVB);
    } else {
      const dataVB1 = arrayData[0];
      let startIndex = dataVB1.Vitriluu.indexOf("\\FILELUU");
      dataVB1.Vitriluu = dataVB1.Vitriluu.slice(startIndex);
      Object.assign(thongtinVB, dataVB1);
    }
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const LaylogVB = async () => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <LaylogVB xmlns="http://tempuri.org/">
            <idFile>${idFile.value}</idFile>
          </LaylogVB>
        </soap12:Body>
      </soap12:Envelope>
     `;

    // Thực hiện request SOAP sử dụng axios
    const response = await axios.post(apiUrl, soapEnvelope, {
      headers: {
        "Content-Type": "application/soap+xml;charset=UTF-8",
      },
    });

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    let dataJson = convertXmlToJson(response.data);
    let arrayData;
    const DocumentElement =
      dataJson["soap:Envelope"]["soap:Body"]["LaylogVBResponse"][
        "LaylogVBResult"
      ]["diffgr:diffgram"]["DocumentElement"];
    if (DocumentElement) {
      arrayData = DocumentElement["LogVB"];
    }
    if (arrayData) {
      if (!isArray(arrayData)) {
        arrayData = [arrayData];
      }
    } else {
      arrayData = [];
    }
    logVB.value = arrayData;
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const modalTuchoiVB = ref(false);
const Lydotuchoi = ref();
const errorTuchoiVB = ref(false);
const openDialogTuchoiVB = async () => {
  Lydotuchoi.value = "";
  modalTuchoiVB.value = true;
};

const handleHuyTuchoiVB = () => {
  Lydotuchoi.value = "";
  modalTuchoiVB.value = false;
};
const handleOkTuchoiVB = async () => {
  try {
    isLoading.value = true;
    errorTuchoiVB.value = false;
    await TuchoiVB();
    Lydotuchoi.value = false;
    modalTuchoiVB.value = false;
    if (!errorTuchoiVB.value) {
      await loadData();
    }
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
};
const TuchoiVB = async () => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <TuchoiVB xmlns="http://tempuri.org/">
            <idFile>${idFile.value}</idFile>
            <Nguoithuchien>${email.value}</Nguoithuchien>
            <Lydotuchoi>${Lydotuchoi.value}</Lydotuchoi>
          </TuchoiVB>
        </soap12:Body>
      </soap12:Envelope>
     `;

    // Thực hiện request SOAP sử dụng axios
    const response = await axios.post(apiUrl, soapEnvelope, {
      headers: {
        "Content-Type": "application/soap+xml;charset=UTF-8",
      },
    });
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "text/xml");
    const resultNode = xmlDoc.getElementsByTagName("TuchoiVBResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerHTML;
    if (Number(resultValue) === -3) {
      message.error("Văn bản không được từ chối");
      errorTuchoiVB.value = true;
    } else if (Number(resultValue) === -2) {
      message.error("Không tồn tại văn bản hoặc không có quyền từ chối");
      errorTuchoiVB.value = true;
    } else if (Number(resultValue) === -1) {
      errorTuchoiVB.value = true;
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) === 1) {
      message.success("Thành công");
      errorTuchoiVB.value = false;
    }
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const kiemTraLaTaiKhoanKy = () => {
  if (
    route.query.CheckKy === "1" &&
    thongtinVB.taikhoanky === email.value &&
    thongtinVB.TrangthaiVB !== 3 &&
    Number(route.query.Trangthaiky) !== 1
  ) {
    laTaiKhoanKy.value = true;
  } else {
    laTaiKhoanKy.value = false;
  }
};
const statusColor = ref("");

const getStatusName = () => {
  if (thongtinVB.TrangthaiVB === 1) {
    statusColor.value = "text-[#0055E6]";
    return "Nháp";
  } else if (thongtinVB.TrangthaiVB === 2) {
    statusColor.value = "text-[#0055E6]";
    return "Chưa hoàn tất";
  } else if (thongtinVB.TrangthaiVB === 3) {
    statusColor.value = "text-[#4CAF4E]";
    return "Đã hoàn tất";
  } else if (thongtinVB.TrangthaiVB === 4) {
    statusColor.value = "text-red-500";
    return "Từ chối";
  } else if (thongtinVB.TrangthaiVB === 5) {
    statusColor.value = "text-red-500";
    return "Thu hồi";
  } else if (thongtinVB.TrangthaiVB === 6) {
    statusColor.value = "text-red-500";
    return "Xóa";
  }
};
const getHinhThucKyName = (hinhthucky: any) => {
  if (hinhthucky === 1) {
    return "Ký số";
  } else if (hinhthucky === 0) {
    return "Phê duyệt và ký điện tử";
  } else {
    return "Nhận bản sao";
  }
};
const kyTaiLieu = async () => {
  if (thongtinthietlapky_hash.Hinhthucky === 0) {
    modalUploadAnhChuKy.value = true;
  } else if (thongtinthietlapky_hash.Hinhthucky === 1) {
    await kyTaiLieu_Kyso();
  }
};
const kyTaiLieu_Kyso = async () => {
  try {
    isLoading.value = true;
    await Laythietlapphuongthuckysomacdinh();
    await Laycert_Serial(thongtinchukyso.Serialno);
    if (thongtinchukyso.NgayHetHanChungThuSo.isBefore(dayjs())) {
      message.error("Thông tin CTS đã hết hạn");
      return;
    }
    const isPdf = String(thongtinthietlapky_hash.Vitriluu || "")
      .toLowerCase()
      .endsWith("pdf");
    if (isPdf) {
      await HashFile();
    }
    await Xoayeucauky_Keyhethong();
    await GuiYeuCauKy();

    let ghepCKY: any;
    if (isPdf) {
      // GhepCKY tự chờ kết quả ký qua rescode rồi ghép PDF.
      // Không gọi LayKetquaky sau đó — tránh treo khi kết quả đã bị GhepCKY lấy hết.
      ghepCKY = await GhepCKY();
    } else {
      await LayKetquakyWithRetry();
      // XML: không qua GhepCKY; đánh dấu OK để tiếp tục cập nhật trạng thái
      ghepCKY = "1";
    }

    const ghepOk = String(ghepCKY ?? "").trim() === "1";
    if (!ghepOk) {
      message.error(
        isEmpty(ghepCKY)
          ? "Yêu cầu ký đã bị từ chối hoặc không có kết quả xác thực ký số"
          : String(ghepCKY)
      );
      return;
    }

    const kyVbKq = await KyVBWithRetry();
    if (!(kyVbKq > 0)) {
      message.error(
        "Ghép chữ ký thành công nhưng cập nhật trạng thái văn bản thất bại sau 3 lần thử. Vui lòng tải lại trang hoặc thử lại để đồng bộ trạng thái."
      );
      return;
    }

    try {
      await Capnhattrangthaihoantat_Code(CodeTuGuiyeucauky.value);
    } catch (e) {
      console.error("Capnhattrangthaihoantat_Code lỗi (không chặn UX):", e);
    }

    // Báo thành công ngay — không chờ gửi mail (tránh quay loading dù đã hoàn tất)
    message.success("Ký thành công!");
    const currentParams = { ...route.query, Trangthaiky: "1" };
    router.push({ query: currentParams });
    await loadData();

    void Promise.allSettled([SendMail_auto(), SendMail_Hoantat_auto()]).then(
      (results) => {
        results.forEach((r, i) => {
          if (r.status === "rejected") {
            console.error(i === 0 ? "SendMail_auto lỗi:" : "SendMail_Hoantat_auto lỗi:", r.reason);
          }
        });
      }
    );
  } catch (error: any) {
    console.log(error);
    const msg = String(error?.message || "");
    if (msg.includes("Quá thời gian lấy kết quả ký")) {
      message.error(
        "Quá thời gian chờ kết quả ký. Nếu app đã ký thành công, hãy tải lại trang để kiểm tra trạng thái."
      );
    } else {
      message.error("Lỗi hệ thống");
    }
  } finally {
    isLoading.value = false;
  }
};

const vneidGateway = String(import.meta.env.VITE_APP_VNEID_GATEWAY_URL || "http://localhost:5244").replace(/\/$/, "");
const vneidOriginator = String(import.meta.env.VITE_APP_VNEID_ORIGINATOR_CODE || "CA2_SignPlatform");
const modalVneId = ref(false);
const vneidCccd = ref("");
const vneidCerts = ref<any[]>([]);
const vneidListError = ref("");
const vneidListLoading = ref(false);
const selectedVneIdId = ref("");
const selectedVneIdCert = computed(() =>
  vneidCerts.value.find((item) => item.credentialID === selectedVneIdId.value)
);

const parseMaybeJson = (data: any) => {
  let value = data;
  for (let i = 0; i < 2 && typeof value === "string"; i++) {
    try {
      value = JSON.parse(value);
    } catch {
      break;
    }
  }
  return value;
};

const baoLoiDanhSachVneId = (noiDung: string) => {
  vneidListError.value = noiDung;
  message.error(noiDung);
};

const openKyVneId = async () => {
  modalVneId.value = true;
  vneidCerts.value = [];
  vneidListError.value = "";
  selectedVneIdId.value = "";
  vneidCccd.value = "";
  vneidListLoading.value = true;
  try {
    const accountXml: any = await getAccountInfor(email.value);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(accountXml, "text/xml");
    const cccd = String(getDataFromXml(xmlDoc, "CCCDan") || "").trim();
    vneidCccd.value = cccd;
    if (!/^\d{12}$/.test(cccd)) {
      baoLoiDanhSachVneId("Tài khoản chưa có CCCD hợp lệ. Hãy cập nhật trong Thông tin tài khoản.");
      return;
    }
    const response = await axios.get(`${vneidGateway}/api/vneid/certificates/list/${encodeURIComponent(cccd)}`, {
      timeout: 180000,
    });
    const body = parseMaybeJson(response.data);
    const status = String(body?.status ?? "");
    if (status !== "01" && status !== "1") {
      baoLoiDanhSachVneId(body?.description || "Không lấy được danh sách chứng thư từ RSVAN.");
      return;
    }
    const data = body?.data;
    const infos = Array.isArray(data)
      ? data
      : data?.credentialInfos || data?.CredentialInfos || data?.credentialInfo || [];
    vneidCerts.value = infos;
    if (vneidCerts.value.length === 1) {
      selectedVneIdId.value = vneidCerts.value[0].credentialID;
    }
  } catch (error: any) {
    const data = parseMaybeJson(error?.response?.data);
    baoLoiDanhSachVneId(
      data?.description || error?.message || "Không kết nối được gateway VNeID."
    );
  } finally {
    vneidListLoading.value = false;
  }
};

const chuanHoaBase64 = (value: string) =>
  String(value || "")
    .replace(/-----BEGIN CERTIFICATE-----/g, "")
    .replace(/-----END CERTIFICATE-----/g, "")
    .replace(/\s+/g, "");

const layChuKyVneId = (value: any) => {
  if (typeof value === "string") return chuanHoaBase64(value);
  if (value && typeof value === "object") {
    return chuanHoaBase64(value.signature || value.signedValue || value.value || "");
  }
  return "";
};

const kyTaiLieu_VneId = async () => {
  const cert = selectedVneIdCert.value;
  const certData = chuanHoaBase64(cert?.cert?.certificates?.[0] || "");
  if (!cert || !certData) {
    message.error("Chọn chứng thư có dữ liệu chứng thư.");
    return;
  }
  const isPdf = String(thongtinthietlapky_hash.Vitriluu || "").toLowerCase().endsWith("pdf");
  if (!isPdf) {
    message.error("Ký VNeID hiện áp dụng cho tài liệu PDF.");
    return;
  }
  const infoStr = String(thongtinthietlapky_hash.Info || "");
  const numberArray = infoStr.split(" ").map(Number);
  if (numberArray.length < 5 || numberArray.some((n) => Number.isNaN(n))) {
    message.error("Chưa có vùng ký trên tài liệu.");
    return;
  }

  modalVneId.value = false;
  isLoading.value = true;
  try {
    const hashResponse = await axios.post(
      `${import.meta.env.VITE_APP_BASE_URL_API}/api/data/HashPDFFile_VNEID`,
      {
        idfile: String(idFile.value),
        taikhoanky: `$${email.value}`,
        serial: cert.cert.serialNumber || cert.credentialID,
        sourcepath: thongtinVB.VitriluuBandau,
        pagesign: numberArray[4],
        itext_x1: numberArray[0],
        itext_y1: numberArray[1],
        itext_x2: numberArray[2],
        itext_y2: numberArray[3],
        signaturefield: thongtinthietlapky_hash.Singnaturefield,
        cert_vneid: certData,
      }
    );
    const hashed = parseMaybeJson(hashResponse.data);
    if (!hashed?.strhash || !hashed?.tempfile) {
      message.error(
        hashed?.error ||
          (typeof hashed === "string" && hashed ? hashed : "Không tạo được dữ liệu băm PDF.")
      );
      return;
    }

    const signResponse = await axios.post(`${vneidGateway}/api/vneid/signings/hash`, {
      credentialID: cert.credentialID || cert.cert.serialNumber,
      originatorCode: vneidOriginator,
      documents: [
        {
          documentName: thongtinVB.TenVBGoc || "document.pdf",
          digestValue: hashed.strhash,
        },
      ],
    });
    const signBody = signResponse.data;
    if (signBody?.status !== "01" || !signBody?.data?.handle) {
      message.error(signBody?.description || "Gateway không nhận yêu cầu ký.");
      return;
    }

    const handle = signBody.data.handle;
    const signRequestId = String(signBody.requestId || "");
    const expiresIn = Number(signBody.data.expiresIn || 300);
    const started = Date.now();
    let signature = "";
    let toldTxn = false;
    message.info("Hãy mở ứng dụng VNeID và xác nhận yêu cầu ký.");
    while ((Date.now() - started) / 1000 < expiresIn) {
      if (!toldTxn) {
        try {
          const events = await axios.get(`${vneidGateway}/api/vneid/events`);
          const match = (events.data?.events || []).find(
            (item: any) => item.handle === handle && item.txnId
          );
          if (match?.txnId) {
            const link = await axios.get(`${vneidGateway}/api/vneid/universal-links/${encodeURIComponent(match.txnId)}`);
            message.info(`Mở VNeID để xác nhận: ${link.data?.shareConsentUrl || match.txnId}`);
            toldTxn = true;
          }
        } catch {
          toldTxn = false;
        }
      }
      const poll = await axios.get(`${vneidGateway}/api/vneid/signings/polling/${encodeURIComponent(handle)}`, {
        headers: signRequestId ? { "X-Request-Id": signRequestId } : undefined,
      });
      const pollBody = poll.data;
      const pollStatus = String(pollBody?.status ?? "");
      if (pollStatus !== "01" && pollStatus !== "1") {
        message.error(pollBody?.description || "Không lấy được kết quả ký từ VNeID.");
        return;
      }
      const data = pollBody?.data;
      const statusCode = Number(data?.statusCode);
      if (statusCode === 0 && data?.signatures?.length) {
        signature = layChuKyVneId(data.signatures[0]);
        break;
      }
      if (statusCode === 1 || statusCode === 3) {
        message.error(statusCode === 3 ? "Người dùng từ chối ký trên VNeID." : "Ký VNeID thất bại.");
        return;
      }
      await delay(3000);
    }
    if (!signature) {
      message.error("Quá thời gian chờ xác nhận trên VNeID.");
      return;
    }

    const mergeResponse = await axios.post(
      `${import.meta.env.VITE_APP_BASE_URL_API}/api/data/GhepCKYVNEID`,
      {
        tempfile: hashed.tempfile,
        sourefile: thongtinVB.VitriluuBandau,
        signaturefield: thongtinthietlapky_hash.Singnaturefield,
        signed_value: signature,
        cert_sign: certData,
      }
    );
    const merged = String(parseMaybeJson(mergeResponse.data) ?? mergeResponse.data ?? "").replace(/^"|"$/g, "").trim();
    if (merged !== "1") {
      message.error(merged || "Không ghép được chữ ký vào PDF.");
      return;
    }

    const kyVbKq = await KyVBWithRetry(false, 3, 1);
    if (!(kyVbKq > 0)) {
      message.error("Đã ghép chữ ký nhưng chưa cập nhật được trạng thái văn bản.");
      return;
    }
    Modal.success({
      title: "Ký VNeID thành công",
      content: `Handle: ${handle}`,
    });
    router.push({ query: { ...route.query, Trangthaiky: "1" } });
    await loadData();
  } catch (error: any) {
    console.log(error);
    const data = parseMaybeJson(error?.response?.data);
    message.error(
      (typeof data === "string" ? data : data?.description || data?.Message) ||
        error?.message ||
        "Lỗi hệ thống khi ký VNeID"
    );
  } finally {
    isLoading.value = false;
  }
};

const modalVerify = ref(false);
const verifyFile = () => {
  modalVerify.value = true;
  console.log("verifyFile");
};
const addFileToFolder = () => {
  console.log("addFileToFolder");
};
const modalShareFile = ref(false);
const handleCancelShareFile = () => {
  modalShareFile.value = false;
};
const handleOkShareFile = () => {
  modalShareFile.value = false;
};
const formDataContact = reactive({
  contactId: "",
  name: "",
  email: "",
});
const listContact = ref<any[]>([
  { label: "Khác", value: "other" },
  { name: "Chris Hoang", label: "chrishoang@cavn", value: 1 },
  { name: "Chris Hoang", label: "chrishoang2@cavn", value: 2 },
  { name: "Chris Hoang", label: "chrishoan3@cavn", value: 3 },
  { name: "Chris Hoang", label: "chrishoan4@cavn", value: 4 },
]);
const showOtherInput = ref(false);
watch(
  () => formDataContact.contactId,
  (newValue, oldValue) => {
    if (newValue === "other") {
      showOtherInput.value = true;
    } else {
      showOtherInput.value = false;
    }
  }
);
const shareFile = () => {
  modalShareFile.value = true;
  console.log("shareFile");
};
const actions = [
  {
    name: "Verify",
    click: verifyFile,
    icon: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM18 11.09C18 15.09 15.45 18.79 12 19.92C8.55 18.79 6 15.1 6 11.09V6.39L12 4.14L18 6.39V11.09Z" fill="black" fill-opacity="0.87"/>
    </svg>
    `,
  },
  {
    name: "Gán danh mục",
    click: addFileToFolder,
    icon: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 6H12L10 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V8C22 6.89 21.11 6 20 6ZM20 18H4V6H9.17L11.17 8H20V18ZM12 14H14V16H16V14H18V12H16V10H14V12H12V14Z" fill="black" fill-opacity="0.87"/>
</svg>

    `,
  },
  {
    name: "Chia sẻ",
    click: shareFile,
    icon: `
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 14.08C14.24 14.08 13.56 14.38 13.04 14.85L5.91 10.7C5.96 10.47 6 10.24 6 10C6 9.76 5.96 9.53 5.91 9.3L12.96 5.19C13.5 5.69 14.21 6 15 6C16.66 6 18 4.66 18 3C18 1.34 16.66 0 15 0C13.34 0 12 1.34 12 3C12 3.24 12.04 3.47 12.09 3.7L5.04 7.81C4.5 7.31 3.79 7 3 7C1.34 7 0 8.34 0 10C0 11.66 1.34 13 3 13C3.79 13 4.5 12.69 5.04 12.19L12.16 16.35C12.11 16.56 12.08 16.78 12.08 17C12.08 18.61 13.39 19.92 15 19.92C16.61 19.92 17.92 18.61 17.92 17C17.92 15.39 16.61 14.08 15 14.08ZM15 2C15.55 2 16 2.45 16 3C16 3.55 15.55 4 15 4C14.45 4 14 3.55 14 3C14 2.45 14.45 2 15 2ZM3 11C2.45 11 2 10.55 2 10C2 9.45 2.45 9 3 9C3.55 9 4 9.45 4 10C4 10.55 3.55 11 3 11ZM15 18.02C14.45 18.02 14 17.57 14 17.02C14 16.47 14.45 16.02 15 16.02C15.55 16.02 16 16.47 16 17.02C16 17.57 15.55 18.02 15 18.02Z" fill="black" fill-opacity="0.87"/>
    </svg>

    `,
  },
];

const pdfSource = ref();
const scale = ref(1);
const totalPage = ref();
const Trangky = ref(1);
const stageConfig = reactive({
  width: 800,
  height: 800,
});
const pdfCanvas = ref(null);
const image = ref<any>();
const pdfDocument = ref<any>();
onMounted(async () => {
  try {
    isLoading.value = true;
    idFile.value = route.query.idFile;
    idthietlap.value = route.query.idthietlap;
    await loadData();
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
});
const loadData = async () => {
  await LayTTVB();
  await LaylogVB();

  pdfSource.value = getFileUrl(thongtinVB.Vitriluu);

  const loadingTask = pdfjsLib.getDocument(pdfSource.value);
  // const loadingTask = pdfjsLib.getDocument("/aloha.pdf");

  try {
    pdfDocument.value = await loadingTask.promise;
    totalPage.value = pdfDocument.value.numPages;
    await getImageData();
    kiemTraLaTaiKhoanKy();
    if (laTaiKhoanKy.value) {
      await Laythongtinthietlapky_hash();
      await getImageData();
    } else {
      rec.value = {};
    }
  } catch (error) {
    console.log(error);
  }
};
const getImageData = async () => {
  const page = await toRaw(pdfDocument.value).getPage(Trangky.value);
  const viewport = page.getViewport({ scale: scale.value });
  const canvas: any = pdfCanvas.value;

  canvas.height = viewport.height;
  canvas.width = viewport.width;
  stageConfig.height = viewport.height;
  stageConfig.width = viewport.width;
  canvas.style.height = `${viewport.width * window.devicePixelRatio}px`;
  canvas.style.width = `${viewport.width * window.devicePixelRatio}px`;
  const canvasContext = canvas.getContext("2d");
  const renderContext = {
    canvasContext,
    viewport,
  };
  await page.render(renderContext).promise;

  const imageDataURL = canvas.toDataURL();
  image.value = new window.Image();
  image.value.src = imageDataURL;
};
const backTrangky = async () => {
  Trangky.value = Trangky.value > 1 ? Trangky.value - 1 : Trangky.value;
  await getImageData();
  if (Number(Trangky.value) !== Number(thongtinthietlapky_hash.Trangky)) {
    rec.value = {};
  } else {
    const infoStr = thongtinthietlapky_hash.Info;
    // Chia chuỗi thành mảng các phần tử dựa trên khoảng trắng
    let numberArray = infoStr.split(" ");

    // Chuyển đổi mỗi phần tử thành số
    numberArray = numberArray.map(Number);
    rec.value = {
      x: numberArray[0],
      y: stageConfig.height - numberArray[1],
      width: numberArray[2] - numberArray[0],
      height: numberArray[1] - numberArray[3],
    };
  }
};
const nextTrangky = async () => {
  Trangky.value =
    Trangky.value < totalPage.value ? Trangky.value + 1 : Trangky.value;
  await getImageData();
  if (Number(Trangky.value) !== Number(thongtinthietlapky_hash.Trangky)) {
    rec.value = {};
  } else {
    const infoStr = thongtinthietlapky_hash.Info;
    // Chia chuỗi thành mảng các phần tử dựa trên khoảng trắng
    let numberArray = infoStr.split(" ");

    // Chuyển đổi mỗi phần tử thành số
    numberArray = numberArray.map(Number);
    rec.value = {
      x: numberArray[0],
      y: stageConfig.height - numberArray[1],
      width: numberArray[2] - numberArray[0],
      height: numberArray[1] - numberArray[3],
    };
  }
};
const scaleUp = async () => {
  scale.value = scale.value < 2 ? scale.value + 0.25 : scale.value;
  await getImageData();
};
const scaleDown = async () => {
  scale.value = scale.value > 0.25 ? scale.value - 0.25 : scale.value;
  await getImageData();
};
// Phần Tải lên tài liệu
const modalUploadAnhChuKy = ref(false);
const fileList = ref<any>([]);
function handleDrop(e: any) {
  console.log(e);
}
const beforeUpload = (file: any) => {
  return false;
};

function resizeImage(image: any) {
  let canvas = document.createElement("canvas");
  let maxWidth = 200; // Define the maximum width of the image
  let maxHeight = 100; // Define the maximum height of the image
  let width = image?.width;
  let height = image?.height;

  // Calculate the new dimensions, maintaining the aspect ratio
  if (width > height) {
    if (width > maxWidth) {
      height *= maxWidth / width;
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width *= maxHeight / height;
      height = maxHeight;
    }
  }

  // Set the canvas dimensions to the new dimensions
  canvas.width = width;
  canvas.height = height;

  // Draw the resized image on the canvas
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL();

  // Insert the canvas into the DOM or use it otherwise
}

const handleChange = async (info: UploadChangeParam) => {
  const hasError = checkFile(info.file);

  if (hasError) return;
  const status = info.file.status;
  if (info.file) {
    message.success("done");
    console.log(info.file);

    const file: any = info?.file;

    imgRef.value = URL.createObjectURL(file);

    const img = new Image();
    img.src = imgRef.value;
    img.onload = function () {
      // Image is loaded; now, resize it
      const res = resizeImage(img);
      imgRef.value = res;
    };
  } else if (status === "error") {
    console.log("error");
  }
};

const listFileType = ["image/png", "image/jpeg", "image/jpeg"];
const checkFile = (file: any) => {
  const mimeTypes = ["image/png", "image/jpeg", "image/jpeg"];
  if (!mimeTypes.includes(file.type)) {
    message.error(`${file.name} không thuộc định dạng được hỗ trợ`);
    return true;
  }
  fileList.value = [file];
  return false;
};
const handleHuyUploadAnhChuKy = () => {
  modalUploadAnhChuKy.value = false;

  signaturePad1.value?.clear();
};
const handleOkUpLoadAnhChuKy = async () => {
  try {
    isLoading.value = true;
    errorTuchoiVB.value = false;
    await kyTaiLieu_KyDienTu();
    modalUploadAnhChuKy.value = false;
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};
const kyDienTu_Sourcefilepdf = ref();
const UploadFile = async () => {
  try {
    isLoading.value = true;
    const url = `${import.meta.env.VITE_APP_BASE_URL_API || "https://apiuploadedoc.nacencomm.vn"}/api/data/Upload?taikhoan=${email.value}&thumucluu=anhchuky`;
    const file = fileList.value[0];
    const formData = new FormData();
    formData.append("file", file);
    const response: any = await axios.post(url, formData);
    const result = response.data[0];
    if (result.kq === 1) {
      kyDienTu_Sourcefilepdf.value = result.sourcefile;
    }
  } catch (err) {
    // err.value = true;
    message.error("Lỗi hệ thống");
    console.error("Error uploading file:", err);
  } finally {
    isLoading.value = false;
  }
};
const Pheduyet_Kydientu = async () => {
  const apiUrl = `${import.meta.env.VITE_APP_BASE_URL_API || "https://apiuploadedoc.nacencomm.vn"}/api/data/Pheduyet_Kydientu?sourcefilepdf=${thongtinVB.Vitriluu}&matailieu=${idFile.value}&taikhoanky=${email.value}&toado=${thongtinthietlapky_hash.Info}`;
  // let file = fileList.value[0];
  let file: any;

  if (activeKeySignModal.value === "1") {
    const imageUrl = imgRef.value;
    const adduu = await fetch(imageUrl);
    const blob = await adduu.blob();
    file = new File([blob], "signature.jpeg", { type: "image/jpeg" });
    console.log(imageUrl);
  } else if (activeKeySignModal.value === "2") {
    const imageUrl = signaturePad1.value?.saveImage("", "image/jpeg");
    const adduu = await fetch(imageUrl);
    const blob = await adduu.blob();
    file = new File([blob], "signature.jpeg", { type: "image/jpeg" });
    console.log(imageUrl);
  } else if (activeKeySignModal.value === "3") {
    const imageUrl =
      textToImage({
        value: textSignature.value,
        font: signatureRadioValue.value?.toString(),
      }) || "";
    const adduu = await fetch(imageUrl);
    const blob = await adduu.blob();
    file = new File([blob], "signature.jpeg", { type: "image/jpeg" });
  }

  const formData = new FormData();
  formData.append("file", file);
  const response: any = await axios.post(apiUrl, formData);
  return response.data;
};
const kyTaiLieu_KyDienTu = async () => {
  try {
    isLoading.value = true;
    let res = await Pheduyet_Kydientu();
    if (Number(res) !== 1) {
      console.log(Number(res));
      message.error("Lỗi hệ thống");
      return;
    }
    // 	Gọi service nghiệp vụ - hàm KyVB cập nhật trạng thái ký. Truyền vào: Mã tài liệu, tài khoản ký, phương thức ký, trình tự ký
    const kyVbKq = await KyVBWithRetry(true);
    if (!(kyVbKq > 0)) {
      message.error(
        "Cập nhật trạng thái văn bản thất bại sau 3 lần thử. Vui lòng tải lại trang hoặc thử lại."
      );
      return;
    }
    message.success("Ký thành công!");
    const currentParams = { ...route.query, Trangthaiky: "1" };
    router.push({ query: currentParams });
    await loadData();

    // Gửi mail nền — không chặn thông báo thành công
    void SendMail_auto().catch((e) => console.error("SendMail_auto lỗi:", e));
  } catch (error) {
    console.log(error);
    message.error("Lỗi hệ thống");
  } finally {
    isLoading.value = false;
  }
};

const handleChangeColor = (value: string) => {
  colorRef.value = value;
  // stateSignature.option.penColor = value;
  signaturePad1.value?.changePenColor(value);
};

const download1 = () => {
  signaturePad1.value?.saveAsPng("10");
};
</script>
