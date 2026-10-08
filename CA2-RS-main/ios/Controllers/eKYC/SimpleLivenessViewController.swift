//
//  SimpleLivenessViewController.swift
//  xverifydemoapp
//
//  Created by Nguyen Hong Doan on 27/07/2024.
//

import UIKit
import AVFoundation
import xverifysdk
import CoreVideo
import Lottie
import SwiftyJSON

class SimpleLivenessViewController: NavigationBarViewController {
    
    @IBOutlet weak private var cameraView: UIView!
    @IBOutlet weak var animationScan: LottieAnimationView!
    @IBOutlet weak var animationLoading: LottieAnimationView!
    @IBOutlet weak var stepInstructionLabel: UILabel!
    
    private var previewLayer: AVCaptureVideoPreviewLayer!
    private lazy var captureSession = AVCaptureSession()
    private lazy var sessionQueue = DispatchQueue(label: Constant.sessionQueueLabel)
    private var lastFrame: CMSampleBuffer?
    public var eidVerified: Bool = false
    public var eidSignatureVerified: Bool = false
    private var cameraSelector: Bool = false
    
    @IBOutlet weak var signalView: UIView!
    
    private var prefixInstruction = ""
    var player: AVAudioPlayer?
    
    private lazy var previewOverlayView: UIImageView = {
        precondition(isViewLoaded)
        let previewOverlayView = UIImageView(frame: .zero)
        previewOverlayView.contentMode = UIView.ContentMode.scaleAspectFill
        previewOverlayView.translatesAutoresizingMaskIntoConstraints = false
        return previewOverlayView
    }()
    
    private lazy var annotationOverlayView: UIView = {
        precondition(isViewLoaded)
        let annotationOverlayView = UIView(frame: .zero)
        annotationOverlayView.translatesAutoresizingMaskIntoConstraints = false
        return annotationOverlayView
    }()
    
    // MARK: - UIViewController
    override func viewDidLoad() {
        super.viewDidLoad()
        //self.navigationItem.title = LOCALIZED("step_3_face_detect")
        setLogoImage(UIImage(named: "ic_header_logo"))
        animationScan.loopMode = .loop
        animationScan.play()
        signalView.layer.cornerRadius = signalView.frame.height/2
        signalView.isHidden = true
        
        animationLoading.isHidden = true
        let fillKeypath = AnimationKeypath(keypath: "**.Fill 1.Color")
        let redValueProvider = ColorValueProvider(LottieColor(r: 0.6, g: 0.6, b: 0.6, a: 1))
        animationLoading.setValueProvider(redValueProvider, keypath: fillKeypath)
        animationLoading.loopMode = .loop
        
        stepInstructionLabel.text = LOCALIZED("put_your_face_in_the_frame").uppercased()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        startSession()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        stopSession()
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
    }
    
    @IBAction func ChangeCameraPressed(_ sender: UIButton) {
        cameraSelector = !cameraSelector
        setUpCaptureSessionInput()
    }
    // --------------------------------------
    // MARK: Overried
    // --------------------------------------
    override func setupUI() {
        self.setupCameraDevice()
        ACTIVEEKYCSERVICE.initialize(referenceImagePath: ONBOARDDATAMANAGER.eidFacePath, verificationMode: .liveness_face_matching, faceDelegate: self, faceResultDelegate: self, verifyDelegate: self,customStepFace: [.face, .smile],navigateDelegate: self)
    }
    
    func setupCameraDevice() {
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
                self.previewLayer.cornerRadius = self.cameraView.frame.height / 2
                
                self.setUpPreviewOverlayView()
                self.setUpAnnotationOverlayView()
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
    
    private func requestVerifyCecaEid(verifyFaceMatch: Bool, capturedFacePath: String?) {
        animationLoading.isHidden = false
        animationLoading.play()
        stepInstructionLabel.text = LOCALIZED("please_wait_verifying").uppercased()
        if let verifyRequest = ONBOARDDATAMANAGER.cecaVerifyRequest {
            print(JSON(verifyRequest.toJsonObj()))
            APISERVICE.verifyCecaEid(path: "", request: verifyRequest, serviceType: 4) { result in
                switch (result) {
                case .success(_):
                    self.animationLoading.stop()
                    //self.navigateToResultView(isVerifyCECA: true, verifyFaceMatch: verifyFaceMatch, capturedFacePath: capturedFacePath ?? "")
                case .failure(_):
                    //self.navigateToResultView(isVerifyCECA: false, verifyFaceMatch: verifyFaceMatch, capturedFacePath: capturedFacePath ?? "")
                    self.animationLoading.stop()
                    self.stopSession()
                }
            }
        }
    }
    
    private func navigateToResultView(verifyFaceMatch: Bool, capturedFacePath: String?) {
        animationLoading.isHidden = false
        animationLoading.play()
        stepInstructionLabel.text = LOCALIZED("please_wait_verifying").uppercased()
        if let eid = ONBOARDDATAMANAGER.eid {
            DISPATCH_ASYNC_MAIN { [weak self] in
                guard let self = self else { return }
                self.navigateToEkycResultView(isValidIdCard: self.eidVerified, verifyFaceMatch: verifyFaceMatch, capturedFacePath: capturedFacePath ?? "")
            }
        }
    }
    
    private func navigateToEkycResultView(isValidIdCard: Bool, verifyFaceMatch: Bool, capturedFacePath: String) {
        DISPATCH_ASYNC_MAIN {
            let controller = INIT_CONTROLLER_XIB(VerifyEkycResultViewController.self)
            controller.isValidIdCard = isValidIdCard
            controller.verifyFaceMatch = verifyFaceMatch
            controller.capturedFacePath = capturedFacePath
            controller.modalPresentationStyle = .fullScreen
            self.present(controller, animated: true, completion: nil)
        }
    }
    
    private func playSound() {
        guard let path = Bundle.main.path(forResource: "sound_beep", ofType:"wav") else {return}
        let url = URL(fileURLWithPath: path)
        do {
            player = try AVAudioPlayer(contentsOf: url)
            player?.play()
        } catch let error {
            print(error.localizedDescription)
        }
    }
    // --------------------------------------
    // MARK: Private
    // --------------------------------------
    private func setupLayerView() {
        cameraView.layer.cornerRadius = cameraView.frame.height / 2.0
        cameraView.layer.borderWidth = 6
        cameraView.layer.borderColor = ColorBrand.appColorWhite.cgColor
        cameraView.clipsToBounds = true
    }
    
    private func setUpCaptureSessionOutput() {
        weak var weakSelf = self
        sessionQueue.async {
            guard let strongSelf = weakSelf else {
                print("Self is nil!")
                return
            }
            strongSelf.captureSession.beginConfiguration()
            strongSelf.captureSession.sessionPreset = AVCaptureSession.Preset.medium
            
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
    }
    
    private func setUpCaptureSessionInput() {
        weak var weakSelf = self
        sessionQueue.async {
            guard let strongSelf = weakSelf else {
                print("Self is nil!")
                return
            }
            let cameraPosition: AVCaptureDevice.Position = self.cameraSelector ? .back : .front
            guard let device = strongSelf.captureDevice(forPosition: cameraPosition) else {
                print("Failed to get capture device for camera position: \(cameraPosition)")
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
        }
    }
    
    private func startSession() {
        weak var weakSelf = self
        sessionQueue.async {
            guard let strongSelf = weakSelf else {
                print("Self is nil!")
                return
            }
            strongSelf.captureSession.startRunning()
        }
    }
    
    private func stopSession() {
        weak var weakSelf = self
        sessionQueue.async {
            guard let strongSelf = weakSelf else {
                print("Self is nil!")
                return
            }
            strongSelf.captureSession.stopRunning()
        }
    }
    
    private func setUpPreviewOverlayView() {
        cameraView.addSubview(previewOverlayView)
        NSLayoutConstraint.activate([
            previewOverlayView.centerXAnchor.constraint(equalTo: cameraView.centerXAnchor),
            previewOverlayView.centerYAnchor.constraint(equalTo: cameraView.centerYAnchor),
            previewOverlayView.leadingAnchor.constraint(equalTo: cameraView.leadingAnchor),
            previewOverlayView.trailingAnchor.constraint(equalTo: cameraView.trailingAnchor),
            
        ])
    }
    
    private func setUpAnnotationOverlayView() {
        cameraView.addSubview(annotationOverlayView)
        NSLayoutConstraint.activate([
            annotationOverlayView.topAnchor.constraint(equalTo: cameraView.topAnchor),
            annotationOverlayView.leadingAnchor.constraint(equalTo: cameraView.leadingAnchor),
            annotationOverlayView.trailingAnchor.constraint(equalTo: cameraView.trailingAnchor),
            annotationOverlayView.bottomAnchor.constraint(equalTo: cameraView.bottomAnchor),
        ])
    }
    
    private func captureDevice(forPosition position: AVCaptureDevice.Position) -> AVCaptureDevice? {
        if #available(iOS 10.0, *) {
            let discoverySession = AVCaptureDevice.DiscoverySession (
                deviceTypes: [.builtInWideAngleCamera],
                mediaType: .video,
                position: .unspecified
            )
            return discoverySession.devices.first { $0.position == position }
        }
        return nil
    }
    
    private func removeDetectionAnnotations() {
        for annotationView in annotationOverlayView.subviews {
            annotationView.removeFromSuperview()
        }
    }
    
    private func updatePreviewOverlayViewWithLastFrame() {
        guard let lastFrame = lastFrame,
              let imageBuffer = CMSampleBufferGetImageBuffer(lastFrame)
        else {
            return
        }
        self.updatePreviewOverlayViewWithImageBuffer(imageBuffer)
        self.removeDetectionAnnotations()
    }
    
    func rotateImage(image: UIImage) -> UIImage {
        if (image.imageOrientation == UIImage.Orientation.up) {
            return image
        }
        UIGraphicsBeginImageContext(image.size)
        image.draw(in: CGRect(origin: .zero, size: image.size))
        let copy = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        
        return copy!
    }
    
    private func updatePreviewOverlayViewWithImageBuffer(_ imageBuffer: CVImageBuffer?) {
        guard let imageBuffer = imageBuffer else {
            return
        }
        let orientation: UIImage.Orientation = .leftMirrored
        if let image = createUIImage(from: imageBuffer, orientation: orientation) {
            previewOverlayView.image = rotateImage(image: image)
        }
    }
    
    private func createUIImage(from imageBuffer: CVImageBuffer, orientation: UIImage.Orientation) -> UIImage? {
        let ciImage = CIImage(cvPixelBuffer: imageBuffer)
        let context = CIContext(options: nil)
        guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else { return nil }
        return UIImage(cgImage: cgImage, scale: 1.0, orientation: orientation)
    }
    
    private func requestBioFaceVerification(idCard:String, captureImage: UIImage) {
        BIOFACADE.requestBioFaceVerification(idCard: idCard, deviceUUID: Utils.sampleDeviceUUID, captureImage: captureImage) { result in
            
            if let onboardingState = result.onboardingState {
                ONBOARDDATAMANAGER.onboardStatus = onboardingState
            }
            
            if let match = result.isMatching, match {
                self.navigateToTransferConfirmView()
            }
            
        } onError: { error in
            Log.error(error.localizedDescription)
        }
        
    }
    
    private func navigateToOTPConfirmView() {
        let controller = OTPConfirmViewController()
        self.navigationController?.pushViewController(controller, animated: true)
    }
    
    
    private func navigateToTransferConfirmView() {
        let controller = TransferConfirmViewController()
        self.navigationController?.pushViewController(controller, animated: true)
    }
    
    func handleVerifyComplete(ekycVerificationMode: EkycVerificationMode, verifyLiveness: Bool, verifyFaceMatch: Bool, capturedFace: String?) {
        animationLoading.stop()
        switch ekycVerificationMode {
        case .liveness:
            print("Only face center")
        case .liveness_face_matching:
            print("Live face & eidFace : verifyFaceMatch")
            navigateToResultView(verifyFaceMatch: verifyFaceMatch, capturedFacePath: capturedFace)
        case .verify_liveness:
            print("Verify left - right - center : verifyLiveness")
        case .verify_liveness_face_matching:
            print("(verify left - right - center) vs (live face & eidFace) : verifyFaceMatch")
            if ONBOARDDATAMANAGER.businessType == .verify_eid_ekyc || ONBOARDDATAMANAGER.businessType == .simple {
                navigateToResultView(verifyFaceMatch: verifyFaceMatch, capturedFacePath: capturedFace)
            } else if ONBOARDDATAMANAGER.businessType == .verify_eid_ceca{
                requestVerifyCecaEid(verifyFaceMatch: verifyFaceMatch, capturedFacePath: capturedFace)
            }
        @unknown default:
            break
        }
    }
    
}

// --------------------------------------
// MARK: AVCaptureVideoDataOutputSampleBufferDelegate
// --------------------------------------
extension SimpleLivenessViewController: AVCaptureVideoDataOutputSampleBufferDelegate {
    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        guard let imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
            print("Failed to get image buffer from sample buffer.")
            return
        }
        lastFrame = sampleBuffer
        let imageWidth = CGFloat(CVPixelBufferGetWidth(imageBuffer))
        let imageHeight = CGFloat(CVPixelBufferGetHeight(imageBuffer))
        
        DISPATCH_ASYNC_MAIN {
            self.updatePreviewOverlayViewWithLastFrame()
        }
        ACTIVEEKYCSERVICE.processDetectFaces(sampleBuffer: sampleBuffer, width: imageWidth, height: imageHeight)
    }
}

// --------------------------------------
// MARK: EkycLivenessDelegate
// --------------------------------------

extension SimpleLivenessViewController: EkycLivenessDelegate {
    func onStep(step: StepFace) {
        if step == .left{
            stepInstructionLabel.text = prefixInstruction + LOCALIZED("please_tilt_your_face_to_the_left").uppercased()
        }else if step == .right{
            stepInstructionLabel.text = prefixInstruction + LOCALIZED("please_tilt_your_face_to_the_right").uppercased()
        }else if step == .face{
            stepInstructionLabel.text =  prefixInstruction + LOCALIZED("please_look_straight").uppercased()
        }else if step == .smile{
            stepInstructionLabel.text = prefixInstruction + LOCALIZED("please_smile").uppercased()
        }else if step == .up{
            stepInstructionLabel.text = prefixInstruction + "Tilt your head up"
        }else if step == .down{
            stepInstructionLabel.text = prefixInstruction + "Tilt your head down"
        }else if step == .far{
            DISPATCH_ASYNC_MAIN {
                self.signalView.isHidden = false
            }
            stepInstructionLabel.text =  LOCALIZED("move_the_phone_away").uppercased()
        }else if step == .near{
            DISPATCH_ASYNC_MAIN {
                self.signalView.isHidden = false
            }
            stepInstructionLabel.text = LOCALIZED("move_the_phone_closer").uppercased()
        }
    }
    
    func onMultiFace() {
        stepInstructionLabel.text = prefixInstruction + LOCALIZED("multi_face").uppercased()
    }
    
    func onNoFace() {
        stepInstructionLabel.text = prefixInstruction + LOCALIZED("put_your_face_in_the_frame").uppercased()
    }
    
    func onPlaySound() {
        playSound()
    }
}

// --------------------------------------
// MARK: EkycVerifyDelegate
// --------------------------------------

extension SimpleLivenessViewController: EkycVerifyDelegate {
    func onFinish() {
        animationLoading.isHidden = true
        animationLoading.pause()
    }
    
    
    
    func onProcess() {
        animationLoading.isHidden = false
        animationLoading.play()
        stepInstructionLabel.text = LOCALIZED("please_wait_verifying").uppercased()
    }
    
    func onVerifyCompleted(ekycVerificationMode: EkycVerificationMode, verifyLiveness: Bool, verifyFaceMatch: Bool, capturedFace: String?) {
        stopSession()
        self.handleVerifyComplete(ekycVerificationMode: ekycVerificationMode, verifyLiveness: verifyLiveness, verifyFaceMatch: verifyFaceMatch, capturedFace: capturedFace)
    }
    
    
    func onFailed(error: NSError, capturedFace: String, ekycVerificationMode: xverifysdk.EkycVerificationMode, errorCode: xverifysdk.EkycVerifyError) {
        animationLoading.stop()
        animationLoading.isHidden = true
        Graphics.showMessage(.error, body: error.localizedDescription)
        if error.code == ErrorCode.verifyLivenessError.rawValue {
            self.startSession()
            ACTIVEEKYCSERVICE.resetAnalysis()
        }
    }
    
    
    ///////////////////////////////////////////////
    //      REQUEST TO SERVER
    ///////////////////////////////////////////////
    
    private func verifySpoofImage(facePath:String?,emotionPath:String?){
        
        if let emotionPath = emotionPath{
            do{
                APISERVICE.verifyEmotionLiveness(path: "", emotionPath:emotionPath, emotion:"smile"){result in
                    switch (result) {
                    case .success(let model):
                        
                        let data = model.data

                        // Kiểm tra nếu trường match trong data khác "1", thì in ra "Giả mạo" và return.
                        if data.match != "1" {
                            Graphics.showMessage(.error, title: "Khuôn mặt bị giả mạo hoặc không cười", body: "")
                            self.navigationController?.popViewController(animated: true)
                            return
                        }
                        
                        self.requestVerifyBio(facePath: facePath)
                    case .failure(let error):
                        print("API request failed with error: \(error)")
                    }
                }
            }
        }

    }
    
    
    private func requestVerifyBio(facePath: String?) {
        guard let facePath = facePath else {
            print("Error: facePath is nil")
            return
        }
        
        guard let faceURlImage = URL(string: facePath) else {
            print("Error: Invalid URL from facePath")
            return
        }
        
        guard let eid = ONBOARDDATAMANAGER.eid else {
            print("Error: eid is nil")
            return
        }
        
        do {
            let imageData = try Data(contentsOf: faceURlImage)
            guard let image = UIImage(data: imageData) else {
                print("Error: Unable to create UIImage from imageData")
                return
            }
            
            BIOFACADE.requestBioFaceVerification(idCard: eid.personOptionalDetails?.eidNumber ?? "", deviceUUID: Utils.sampleDeviceUUID, captureImage: image) { result in
                if let status = result.onboardingState {
                    ONBOARDDATAMANAGER.onboardStatus = status
                }
                
                if let isMatch = result.isMatching {
                    self.navigateToOTPConfirmView()
                    ONBOARDDATAMANAGER.ekycFront = facePath
                }
            } onError: { error in
                Log.error(error.localizedDescription)
            }
            
        } catch {
            print("Error loading image: \(error)")
        }
    }
}

extension SimpleLivenessViewController: EkycLivenessNavigateDelegate {
    func onResetState() {
        prefixInstruction = ""
    }
    
    func onReadyDetect(isReady: Bool) {
        DISPATCH_ASYNC_MAIN {
            if !isReady {
                self.signalView.backgroundColor = .red
            } else {
                self.signalView.backgroundColor = .green
            }
        }
        
    }
    
    func onNavigateState(ekycLivenessState: EkycLivenessState) {
        switch ekycLivenessState {
        case .KEEP_STABLE:
            prefixInstruction = LOCALIZED("keep_the_phone_intact")
        case .THE_DISTANCE_IS_NEAR:
            prefixInstruction = LOCALIZED("return_the_phone_to_its_original_position")
        case .THE_DISTANCE_IS_FAR:
            prefixInstruction = LOCALIZED("return_the_phone_to_its_original_position")
        case .NORMAL:
            prefixInstruction = ""
        @unknown default:
            Log.error("Not implemented")
        }
    }
}

extension SimpleLivenessViewController: EkycFaceResultDelegate {
    func onFaceFar(_ faceFar: String) {
        DISPATCH_ASYNC_MAIN {
            self.signalView.isHidden = true
        }
    }
    
    func onFaceNear(_ faceNear: String) {
        DISPATCH_ASYNC_MAIN {
            self.signalView.isHidden = true
        }
    }
}
