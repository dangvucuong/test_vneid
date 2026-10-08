import AVFoundation
import CoreVideo
import Lottie
import SwiftyJSON
import xverifysdk

class CaptureFrontFaceViewController : NavigationBarViewController {
    
    @IBOutlet weak private var cameraView: UIView!
    @IBOutlet weak var animationScan: LottieAnimationView!
    @IBOutlet weak var animationLoading: LottieAnimationView!
    @IBOutlet weak var btnChangeCamera: UIButton!
    var transferType: TransferType = .TypeC
    
    @IBOutlet weak var stepInstructionLabel: UILabel!
    
    private var previewLayer: AVCaptureVideoPreviewLayer!
    private lazy var captureSession = AVCaptureSession()
    private lazy var sessionQueue = DispatchQueue(label: Constant.sessionQueueLabel)
    private var lastFrame: CMSampleBuffer?
    
    var cameraSelecter: Bool = false
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
        setLogoImage(UIImage(named: "ic_header_logo"))
        animationScan.loopMode = .loop
        animationScan.play()
        
        animationLoading.isHidden = true
        let fillKeypath = AnimationKeypath(keypath: "**.Fill 1.Color")
        let redValueProvider = ColorValueProvider(LottieColor(r: 0.6, g: 0.6, b: 0.6, a: 1))
        animationLoading.setValueProvider(redValueProvider, keypath: fillKeypath)
        animationLoading.loopMode = .loop
        
        btnChangeCamera.layer.cornerRadius = 999
        btnChangeCamera.titleLabel?.text = ""
        btnChangeCamera.backgroundColor = ColorBrand.appColorBlack
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
    
    // --------------------------------------
    // MARK: Event
    // --------------------------------------
    
    @IBAction func btnChangeCameraPressed(_ sender: UIButton) {
        cameraSelecter = !cameraSelecter
        setUpCaptureSessionInput()
    }
    
    // --------------------------------------
    // MARK: Overried
    // --------------------------------------
    
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
                self.previewLayer.cornerRadius = self.cameraView.frame.height / 2
                
                self.setUpPreviewOverlayView()
                self.setUpAnnotationOverlayView()
                self.setUpCaptureSessionOutput()
                self.setUpCaptureSessionInput()
                self.setupLayerView()
            }
        })
            ACTIVEEKYCSERVICE.initialize(referenceImagePath: ONBOARDDATAMANAGER.eidFacePath, verificationMode: .liveness, faceDelegate: self, faceResultDelegate: self, verifyDelegate: self,customStepFace: [.smile,.face],navigateDelegate: nil)
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
        if let verifyRequest = ONBOARDDATAMANAGER.cecaVerifyRequest {
            print(JSON(verifyRequest.toJsonObj()))
            APISERVICE.verifyCecaEid(path: "", request: verifyRequest, serviceType: 4) { result in
                switch (result) {
                case .success(_):
                    self.animationLoading.stop()
                case .failure(_):
                    self.animationLoading.stop()
                    self.stopSession()
                }
            }
        }
    }
    
    
    private func navigateToTransferResult(capturedFacePath: String) {
        let controller = INIT_CONTROLLER_XIB(TransferConfirmViewController.self)
        self.navigationController?.pushViewController(controller, animated: true)
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
            let cameraPosition: AVCaptureDevice.Position = self.cameraSelecter ? .back : .front
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
        let orientation: UIImage.Orientation = cameraSelecter ? .right : .leftMirrored
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
    
    private func navigateToTransferSuccessView() {
        let controller = INIT_CONTROLLER_XIB(TransferSuccessViewController.self)
        self.navigationController?.pushViewController(controller, animated: true)
    }
    
    private func navigateToOTPScreen() {
        let controller = INIT_CONTROLLER_XIB(OTPConfirmViewController.self)
        self.navigationController?.pushViewController(controller, animated: true)
    }
    
    private func perforomFaceVerification() {
        
    }
    
}

// --------------------------------------
// MARK: AVCaptureVideoDataOutputSampleBufferDelegate
// --------------------------------------
extension CaptureFrontFaceViewController: AVCaptureVideoDataOutputSampleBufferDelegate {
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

        //ACTIVEEKYCSERVICE.processDetectFrontFace(sampleBuffer: sampleBuffer, width: imageWidth, height: imageHeight)
    }
}

// --------------------------------------
// MARK: EkycLivenessDelegate
// --------------------------------------
extension CaptureFrontFaceViewController: EkycLivenessDelegate {
    func onStep(step: StepFace) {
        if step == .face{
            stepInstructionLabel.text = LOCALIZED("please_look_straight").uppercased()
        } else if step == .smile{
            stepInstructionLabel.text =  LOCALIZED("please_smile").uppercased()
        }
    }
    
    func onMultiFace() {
        stepInstructionLabel.text = LOCALIZED("multi_face").uppercased()
    }
    
    func onNoFace() {
    }
    
    func onPlaySound() {
        playSound()
    }
}

// --------------------------------------
// MARK: EkycVerifyDelegate
// --------------------------------------

extension CaptureFrontFaceViewController: EkycVerifyDelegate {
    func onFinish() {
        animationLoading.isHidden = true
        animationLoading.pause()
    }
    
    
    func onProcess() {
        animationLoading.isHidden = false
        animationLoading.play()
    }
    
    func onVerifyCompleted(ekycVerificationMode: EkycVerificationMode, verifyLiveness: Bool, verifyFaceMatch: Bool, capturedFace: String?) {
        print("IS MATCH =====> \(verifyFaceMatch)")
        animationLoading.stop()
        stopSession()
        switch ekycVerificationMode {
        case .liveness:
            print("Liveness")
        case .liveness_face_matching:
            print("Live face & eidFace : verifyFaceMatch")
        case .verify_liveness:
            print("Verify left - right - center : verifyLiveness")
        case .verify_liveness_face_matching:
            print("(verify left - right - center) vs (live face & eidFace) : verifyFaceMatch")
        @unknown default:
            break
        }
    }
    
    func onFailed(error: NSError, capturedFace: String, ekycVerificationMode: EkycVerificationMode, errorCode: EkycVerifyError) {
        animationLoading.stop()
        animationLoading.isHidden = true
        Graphics.showMessage(.error, body: error.localizedDescription)
        if error.code == ErrorCode.verifyLivenessError.rawValue {
            self.startSession()
        }
    }
}

extension CaptureFrontFaceViewController: EkycFaceResultDelegate {
    
    func onFaceCenter(_ faceCenter: String) {
            }
    
    func onSmile(_ faceSmile: String) {
        stopSession()
        if ONBOARDDATAMANAGER.businessType == .transfer {
            animationLoading.isHidden = false
            animationLoading.play()
            stepInstructionLabel.text = LOCALIZED("please_wait_verifying").uppercased()
            
            guard let faceSmilePath = URL(string: faceSmile) else {
                print("Invalid faceSmile path")
                return
            }
            
            APISERVICE.verifyEmotionLiveness(path: "", emotionPath: faceSmilePath.absoluteString, emotion: "smile") { result in
                switch result {
                case .success(let model):
                    let data = model.data
                    
                    if data.match != "1" {
                        Graphics.showMessage(.error, title: LOCALIZED("the_face_is_fake"), body: "")
                        self.navigationController?.popViewController(animated: true)
                        return
                    }
                    
                    self.requestTransactionFaceConfirm(faceCenter: faceSmilePath.absoluteString)
                    
                case .failure(let error):
                    print("API request failed with error: \(error)")
                }
            }
        }
    }
        
        
        
        func requestTransactionFaceConfirm(faceCenter:String){
            if let faceURlImage = URL(string: faceCenter), let eid = ONBOARDDATAMANAGER.eid {
                do {
                    let imageData = try Data(contentsOf: faceURlImage)
                    let image = UIImage(data: imageData) ?? UIImage()
                    BIOFACADE.requestTransactionFaceConfirm(idCard: eid.personOptionalDetails?.eidNumber ?? "", captureImage: image, deviceUUID: Utils.sampleDeviceUUID, transcationType: self.transferType == .TypeC ? .TypeC : .TypeD) { result in
                        //Thông báo nếu tỉ lệ thấp
                        if result.biometricConfidence ?? 0.0 < 80.0 {
                            Graphics.showMessage(.error, title: "Khuôn mặt không khớp", body: "")
                            self.navigationController?.popViewController(animated: true)
                            
                            return
                        }
                        ONBOARDDATAMANAGER.currentOnboardFace = faceCenter
                        ONBOARDDATAMANAGER.bioImageOnboard = faceCenter
                        if self.transferType == .TypeC {
                            self.navigateToTransferSuccessView()
                        } else {
                            self.navigateToOTPScreen()
                        }
                    } onError: { error in
                        Log.error(error.localizedDescription)
                    }
                    
                    
                } catch {
                    print("Error loading image : \(error)")
                }
            }
        }
    
}
