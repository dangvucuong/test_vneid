//
//  QrScannerViewController.swift
//  xverifydemoapp
//
//  Created by Creative Infoway on 18/09/2024.
//

import UIKit
import AVFoundation

class QrScannerViewController: ChildViewController {
    
    @IBOutlet weak private var cameraView: UIView!
    @IBOutlet weak var cameraFrameImage: UIView!
    var cameraDevice: AVCaptureDevice?

    var captureSession = AVCaptureSession()
    var previewLayer: AVCaptureVideoPreviewLayer!
    
    var isFinished = false
    private var basicInfomation: BasicInformation? = nil
    
    // --------------------------------------
    // MARK: Overried
    // --------------------------------------

    override func viewDidLoad() {
        super.viewDidLoad()
        setLogoImage(UIImage(named: "ic_header_logo"))
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        isFinished = false
        startSession()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        DISPATCH_ASYNC_MAIN_AFTER(1) {
            self.zoomCamera()
        }
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        stopSession()
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        cameraFrameImage.frame = cameraView.frame
    }
    
    override func setupUI() {
        AVCaptureDevice.requestAccess(for: AVMediaType.video, completionHandler: { success in
            if success == false {
                DISPATCH_ASYNC_MAIN {
                    self.setupLayerView()
                }
                return
            }
            DISPATCH_ASYNC_MAIN {
                
                self.previewLayer = AVCaptureVideoPreviewLayer(session: self.captureSession)
                self.previewLayer.videoGravity = AVLayerVideoGravity.resizeAspectFill
                self.previewLayer.frame = self.cameraView.frame
                self.previewLayer.cornerRadius = 10
                self.view.layer.addSublayer(self.previewLayer)
                
                self.setUpCaptureSessionOutput()
                self.setUpCaptureSessionInput()
                self.setupLayerView()
            }
        })
        
    }
    
    override var leftBarButton: UIButton? {
        let button = UIButton(frame: CGRect(x: 0, y: 0, width: 24, height: 24))
        button.backgroundColor = .clear
        button.setImage(UIImage(named: "ic_action_arrowback"), for: .normal)
        button.tintColor = .white
        return button
    }
    
    override func handleLeftBarButtonEvent() {
        if let navigationController = self.navigationController {
            navigationController.popViewController(animated: true)
        }
    }
    
    // --------------------------------------
    // MARK: Private
    // --------------------------------------
    
    private func setupLayerView() {
        cameraView.layer.cornerRadius = 10.0
        self.view.bringSubviewToFront(self.cameraFrameImage)
     }
    
    private func captureDevice(forPosition position: AVCaptureDevice.Position) -> AVCaptureDevice? {
//      if #available(iOS 10.0, *) {
//        let discoverySession = AVCaptureDevice.DiscoverySession(
//          deviceTypes: [.builtInWideAngleCamera],
//          mediaType: .video,
//          position: .unspecified
//        )
//        return discoverySession.devices.first { $0.position == position }
//      }
//      return nil
        guard let captureDevice = AVCaptureDevice.default(for: .video) else {
            print("Failed to access the camera.")
            return nil
        }
    
        cameraDevice = captureDevice
        return captureDevice
    }
    
    private func setUpCaptureSessionOutput() {
        weak var weakSelf = self
        guard let strongSelf = weakSelf else {
            print("Self is nil!")
            return
        }
        strongSelf.captureSession.beginConfiguration()
        strongSelf.captureSession.sessionPreset = AVCaptureSession.Preset.high

        let output = AVCaptureVideoDataOutput()
        output.videoSettings = [(kCVPixelBufferPixelFormatTypeKey as String): kCVPixelFormatType_32BGRA]
        output.alwaysDiscardsLateVideoFrames = true
        let outputQueue = DispatchQueue(label: Constant.videoDataOutputQueueLabel)
        output.setSampleBufferDelegate(strongSelf, queue: outputQueue)
        guard strongSelf.captureSession.canAddOutput(output) else {
            print("Failed to add capture session output.")
            return
        }
        strongSelf.captureSession.addOutput(output)
        strongSelf.captureSession.commitConfiguration()
    }
    
    private func setUpCaptureSessionInput() {
        weak var weakSelf = self
        guard let strongSelf = weakSelf else {
            print("Self is nil!")
            return
        }
        guard let device = strongSelf.captureDevice(forPosition: .back) else {
            print("Failed to get capture device for camera position: back")
            return
        }
        do {
            strongSelf.captureSession.beginConfiguration()
            let currentInputs = strongSelf.captureSession.inputs
            for input in currentInputs {
                strongSelf.captureSession.removeInput(input)
            }

            let input = try AVCaptureDeviceInput(device: device)
            guard strongSelf.captureSession.canAddInput(input) else {
                print("Failed to add capture session input.")
                return
            }
            strongSelf.captureSession.addInput(input)
            strongSelf.captureSession.commitConfiguration()
        } catch {
            print("Failed to create capture device input: \(error.localizedDescription)")
        }
        DISPATCH_ASYNC_MAIN_AFTER(1) {
            self.zoomCamera()
        }
    }
    
    private func startSession() {
        weak var weakSelf = self
        DISPATCH_ASYNC_BG {
            guard let strongSelf = weakSelf else {
                print("Self is nil!")
                return
            }
            strongSelf.captureSession.startRunning()
        }
    }

    private func stopSession() {
        weak var weakSelf = self
        DISPATCH_ASYNC_BG {
            guard let strongSelf = weakSelf else {
                print("Self is nil!")
                return
            }
            strongSelf.captureSession.stopRunning()
        }
    }
    
    @available(iOS 14.0, *)
    func processQr(sampleBuffer: CMSampleBuffer) {
        
        QRCodeReader.processQr(sampleBuffer: sampleBuffer) { [weak self] data in
            guard let self = self else { return }
            guard let barcodes = data else {
                return
            }
            if barcodes.isEmpty { return }
            
            if self.captureSession.isRunning == true {
                self.captureSession.stopRunning()
            }
            
            if isFinished { return }
            isFinished = true
            if ONBOARDDATAMANAGER.businessType == .qr_code{
                DISPATCH_ASYNC_MAIN {
                    let controller = INIT_CONTROLLER_XIB(GtinVerifyViewController.self)
                    controller.gtinNumber = barcodes[0]
                    self.navigationController?.pushViewController(controller, animated: true)
                }
            }else{
                DISPATCH_ASYNC_MAIN {
                    self.handleQRScannerForEid(qrString: barcodes[0])
                }
            }
        }
    }
    
    func handleQRScannerForEid(qrString: String?) {
        guard let qrString = qrString else {return}
        basicInfomation = EIDFACADE.parserQrCode(result: qrString)
        ONBOARDDATAMANAGER.mrzKey = try! EIDFACADE.buildMrz(eidNumber: basicInfomation?.eidNumber, dateOfBirth: basicInfomation?.dateOfBirth, dateOfIssue: basicInfomation?.dateOfIssue) ?? ""
              self.showNFCGuideVC()
    }
    
    private func showNFCGuideVC() {
        let vc = INIT_CONTROLLER_XIB(NFCGuideViewController.self)
        vc.modalPresentationStyle = .overFullScreen
        vc.confirmCallBack = { [weak self] in
            self?.startNfcScan()
        }
        present(vc, animated: true)
    }
    
    private func startNfcScan() {
        self.cameraFrameImage.isHidden = true
        EIDFACADE.readChipNfc(mrzKey: ONBOARDDATAMANAGER.mrzKey, basicInformation: basicInfomation) { eid in
            self.nfcEidRead(eid: eid)
        } errorHandler: { error in
        }
    }
    
    private func nfcEidRead(eid: Eid?) {
        ONBOARDDATAMANAGER.eid = eid
        
        let request = CecaRequestModel()
        let info = CecaInfoRequestModel()
        info.version = "1.0.0"
        info.senderId = "CECA001"
        info.receiverId = "GTELEKYC"
        info.messageType = 101
        info.sendDate = Date().millisecondsSince1970
        info.messageId = CecaUtils.generateMessageId(senderId: "CECA001")
        request.info = info
        
        let content = CecaContentRequestModel()
        content.transactionId = UUID().uuidString.replacingOccurrences(of: "-", with: "").uppercased()
        let contentData = CecaDataRequestModel()
        contentData.code = "VDT"
        contentData.cecaTransactionCode = UUID().uuidString.replacingOccurrences(of: "-", with: "").uppercased()
        contentData.dsCert = eid?.documentSigningCertificate?.certToPEM().toBase64() ?? ""
        contentData.idCardNumber = eid?.personOptionalDetails?.eidNumber ?? ""
        contentData.deviceType = APP.deviceType
        if let province = eid?.personOptionalDetails?.placeOfResidence {
            contentData.province = CecaUtils.getProvince(address: province) ?? ""
        }
        content.data = contentData
        request.content = content
        
        request.signature = CecaUtils.generateSignature(secretKey: "2540E77E5DF54A6493C5D8F2EF585C8E", request: request)
        
        ONBOARDDATAMANAGER.cecaVerifyRequest = request
        var eidVerified: Bool = false
        var eidSignatureVerified: Bool = false
        
        
        DISPATCH_ASYNC_MAIN_AFTER(2) {
            if ONBOARDDATAMANAGER.businessType == .verify_eid {
                self.navigateToVerifyingEidView()
            } else if ONBOARDDATAMANAGER.businessType == .verify_eid_ekyc || ONBOARDDATAMANAGER.businessType == .transfer || ONBOARDDATAMANAGER.businessType == .passive || ONBOARDDATAMANAGER.businessType == .simple ||
                        ONBOARDDATAMANAGER.businessType == .verify_eid_ceca || ONBOARDDATAMANAGER.businessType == .ocr || ONBOARDDATAMANAGER.businessType == .ekyb {
                self.navigateToLivenessView(eidVerified: eidVerified, eidSignatureVerified: eidSignatureVerified)
            }
        }
    }
    
    private func navigateToLivenessView(eidVerified: Bool, eidSignatureVerified: Bool) {
        requestVerifyEid { eidVerified,eidSignatureVerified in
            if let eid = ONBOARDDATAMANAGER.eid {
                if ONBOARDDATAMANAGER.businessType == .transfer {
                    BIOFACADE.requestRarVerification(eid: eid, deviceUUID: Utils.sampleDeviceUUID, deviceName: UIDevice.current.name) { rarResult in
                        ONBOARDDATAMANAGER.onboardStatus = rarResult.onboardingState
                        if rarResult.responds.result {
                            DISPATCH_ASYNC_MAIN {
                                let controller = INIT_CONTROLLER_XIB(LivenessViewController.self)
                                controller.eidVerified = eidVerified
                                controller.eidSignatureVerified = eidSignatureVerified
                                self.navigationController?.pushViewController(controller, animated: true)
                            }
                        }
                    } onError: { error in
                        Log.error(error.localizedDescription)
                    }
                    
                } else if ONBOARDDATAMANAGER.businessType == .verify_eid_ekyc{
                    DISPATCH_ASYNC_MAIN {
                        let controller = INIT_CONTROLLER_XIB(LivenessViewController.self)
                        controller.eidVerified = eidVerified
                        controller.eidSignatureVerified = eidSignatureVerified
                        self.navigationController?.pushViewController(controller, animated: true)
                    }
                } else if ONBOARDDATAMANAGER.businessType == .verify_eid_ceca{
                    DISPATCH_ASYNC_MAIN {
                        let controller = INIT_CONTROLLER_XIB(LivenessViewController.self)
                        controller.eidVerified = eidVerified
                        controller.eidSignatureVerified = eidSignatureVerified
                        self.navigationController?.pushViewController(controller, animated: true)
                    }
                } else if ONBOARDDATAMANAGER.businessType == .simple {
                    DISPATCH_ASYNC_MAIN {
                        let controller = INIT_CONTROLLER_XIB(SimpleLivenessViewController.self)
                        controller.eidVerified = eidVerified
                        controller.eidSignatureVerified = eidSignatureVerified
                        self.navigationController?.pushViewController(controller, animated: true)
                    }
                } else if ONBOARDDATAMANAGER.businessType == .passive {
                    DISPATCH_ASYNC_MAIN {
                        let controller = INIT_CONTROLLER_XIB(PassiveEkycViewController.self)
                        controller.eidVerified = eidVerified
                        controller.eidSignatureVerified = eidSignatureVerified
                        self.navigationController?.pushViewController(controller, animated: true)
                    }
                } else if ONBOARDDATAMANAGER.businessType == .ocr{
                    DISPATCH_ASYNC_MAIN {
                        let controller = INIT_CONTROLLER_XIB(LivenessViewController.self)
                        controller.eidVerified = eidVerified
                        controller.eidSignatureVerified = eidSignatureVerified
                        self.navigationController?.pushViewController(controller, animated: true)
                    }
                } else if ONBOARDDATAMANAGER.businessType == .ekyb{
                    DISPATCH_ASYNC_MAIN {
                        let controller = INIT_CONTROLLER_XIB(LivenessViewController.self)
                        controller.eidVerified = eidVerified
                        controller.eidSignatureVerified = eidSignatureVerified
                        self.navigationController?.pushViewController(controller, animated: true)
                    }
                }
            }
        }
    }
    
    private func requestVerifyEid(completion: @escaping ((Bool,Bool)->Void)) {
        
        if let eid = ONBOARDDATAMANAGER.eid {
            
            APISERVICE.verifyEid(path: "", idCard: eid.personOptionalDetails?.eidNumber ?? "", dsCert: eid.documentSigningCertificate?.certToPEM().toBase64() ?? "", deviceType: APP.deviceType, province: eid.personOptionalDetails?.placeOfOrigin ?? "", code: Bundle.main.infoDictionary?["CUSTOMER_CODE"] as! String) { result in
                switch result{
                case .success(let eidVerifyModel):
                    let invalidModel = eidVerifyModel.isValidIdCard
                    if invalidModel {
                        ONBOARDDATAMANAGER.eid?.agencyVerified = invalidModel
                        let publicKeyUrl = Bundle.main.url(forResource: "public", withExtension: "pem") ?? URL(fileURLWithPath: "")
                        if let verifiedEid = ONBOARDDATAMANAGER.eid?.verifyRsaSignature(publicKeyUrl: publicKeyUrl, plainText: eidVerifyModel.responds!, signature: eidVerifyModel.signature) {
                            ONBOARDDATAMANAGER.eid?.agencySignatureChecksum = verifiedEid
                            let verifiedSignature = ONBOARDDATAMANAGER.eid?.verifyRsaSignature(plainText: eidVerifyModel.responds ?? "", signature: eidVerifyModel.signature) ?? false
                            if let eidFaceImage = ONBOARDDATAMANAGER.eid?.faceImage {
                                let fileName = "ID_\(Date().millisecondsSince1970).jpg"
                                let path = Utils.saveFileToLocal(eidFaceImage, fileName: fileName)
                                ONBOARDDATAMANAGER.eidFacePath = path.absoluteString
                            }
                            completion(invalidModel,verifiedSignature)
                        }else{
                            Graphics.showAlert(title: LOCALIZED("verify_fail"), message: LOCALIZED("error_verification"), otherTitle: LOCALIZED("try_again_button")) {
                                if let navigationController = self.navigationController {
                                    navigationController.popViewController(animated: true)
                                }
                            }
                        }
                    }
                case .failure(_):
                    Graphics.showAlert(title: LOCALIZED("verify_fail"), message: LOCALIZED("error_verification"), otherTitle: LOCALIZED("try_again_button")) {
                        if let navigationController = self.navigationController {
                            navigationController.popViewController(animated: true)
                        }
                    }
                }
            }
        }
    }
    
    private func navigateToVerifyingEidView() {
        DISPATCH_ASYNC_MAIN {
            let controller = INIT_CONTROLLER_XIB(VerifyingEidViewController.self)
            self.navigationController?.pushViewController(controller, animated: true)
        }
    }
    
    func zoomCamera() {
        guard let cameraDevice = cameraDevice else { return }

        do {
            try cameraDevice.lockForConfiguration()

            // Apply the calculated zoom factor within limits
            let maxZoomFactor = cameraDevice.activeFormat.videoMaxZoomFactor
            let newZoomFactor = min(2.5, maxZoomFactor)

            cameraDevice.videoZoomFactor = newZoomFactor
            cameraDevice.unlockForConfiguration()

            print("Set zoom ratio: \(newZoomFactor)")

        } catch {
            print("Failed to lock configuration: \(error)")
        }
    }
}

@available(iOS 14.0, *)
extension QrScannerViewController: AVCaptureVideoDataOutputSampleBufferDelegate {
    public func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        guard let imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
          print("Failed to get image buffer from sample buffer.")
          return
        }
        self.processQr(sampleBuffer: sampleBuffer)
    }
}

extension QrScannerViewController: AVCaptureMetadataOutputObjectsDelegate {
    
    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        if let metadataObject = metadataObjects.first as? AVMetadataMachineReadableCodeObject {
            guard let cameraDevice = cameraDevice else { return }
            
            // Here, you can implement a custom zoom logic based on the detected barcode/QR code
            autoZoomForDetectedCode(metadataObject)
        }
    }
    // Custom function to handle auto zoom logic
    func autoZoomForDetectedCode(_ metadataObject: AVMetadataMachineReadableCodeObject) {
        guard let cameraDevice = cameraDevice else { return }

        // Simulate zoom based on the bounding box of the detected code
        let zoomFactor: CGFloat = calculateZoomFactor(for: metadataObject.bounds)

        do {
            try cameraDevice.lockForConfiguration()

            // Apply the calculated zoom factor within limits
            let maxZoomFactor = cameraDevice.activeFormat.videoMaxZoomFactor
            let newZoomFactor = min(max(zoomFactor, 1.0), maxZoomFactor)

            cameraDevice.videoZoomFactor = newZoomFactor
            cameraDevice.unlockForConfiguration()

            print("Set zoom ratio: \(newZoomFactor)")

        } catch {
            print("Failed to lock configuration: \(error)")
        }
    }

    // Example zoom factor calculation based on the bounding box of the detected code
    func calculateZoomFactor(for bounds: CGRect) -> CGFloat {
        // Custom zoom logic based on the size and position of the detected QR/barcode
        // For example, the smaller the bounding box, the higher the zoom factor
        let area = bounds.width * bounds.height
        let screenArea = view.frame.width * view.frame.height

        // Simple zoom calculation (can be adjusted based on your use case)
        return screenArea / area
    }
}
