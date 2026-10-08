//
//  TakePhotoViewController.swift
//  xverifydemoapp
//
//  Created by Nguyễn Hiếu on 14/2/25.
//

import UIKit
import xverifysdk

public enum VerifyDocumentType: String {
    case businessCertificate = "DKKD_DN"
    case branchRegistrationCertificate = "DKKD_CN"
    case businessHousehold = "DKKD_HKD"
}

class EkybUploadDocumentViewController: NavigationBarViewController {
    
    let options = [LOCALIZED("business_registration_enterprise"),LOCALIZED("business_registration_branch"),LOCALIZED("business_registration_household")]
    
    private let label: UILabel = {
        let label = UILabel()
        label.text = LOCALIZED("please_select_and_upload_document")
        label.textAlignment = .center
        return label
    }()
    
    private let textField: UITextField = {
        let textField = UITextField()
        return textField
    }()
    
    private let pickerView: UIPickerView = {
        let pickerView = UIPickerView()
        return pickerView
    }()
    
    private let continueButton: UIButton = {
        let button = UIButton()
        return button
    }()
    
    private var collectionView: UICollectionView?
    private var selectedImages = [UIImage?]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setLogoImage(UIImage(named: "ic_header_logo"))
        view.backgroundColor = ColorBrand.appColorDarkGray
        setupLabel()
        setupTextField()
        setupPickerView()
        setupCollectionView()
        setupContinueButton()
        setupConstraints()
        continueButton.layer.cornerRadius = 25
    }
    
    func setupLabel(){
        label.textColor = .white
        label.numberOfLines = 0
        label.lineBreakMode = .byWordWrapping
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
    }
    
    func setupTextField() {
        textField.borderStyle = .roundedRect
        textField.placeholder = LOCALIZED("select_an_option")
        textField.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(textField)
        textField.inputView = pickerView
    }
    
    @objc func dismissPicker() {
        view.endEditing(true)
    }
    
    func setupPickerView() {
        pickerView.delegate = self
        pickerView.dataSource = self
    }
    
    func setupCollectionView(){
        let layout = UICollectionViewFlowLayout()
        layout.sectionInset = UIEdgeInsets(top: 0, left: 1, bottom: 0, right: 1)
        layout.minimumLineSpacing = 20
        layout.minimumInteritemSpacing = 20
        let size = (view.frame.size.width - 120)/3
        layout.itemSize = CGSize(width: size, height: size)
        collectionView = UICollectionView(frame: .zero, collectionViewLayout: layout)
        collectionView?.translatesAutoresizingMaskIntoConstraints = false
        collectionView?.backgroundColor = .clear
        
        //Cell
        collectionView?.register(PhotoCollectionViewCell.self, forCellWithReuseIdentifier: PhotoCollectionViewCell.identifier)
        collectionView?.delegate = self
        collectionView?.dataSource = self
        
        guard let collectionView = collectionView else {return}
        view.addSubview(collectionView)
    }
    
    func setupContinueButton(){
        continueButton.translatesAutoresizingMaskIntoConstraints = false
        continueButton.backgroundColor = ColorBrand.appColorGreen
        continueButton.setTitle(LOCALIZED("next_button").uppercased(), for: .normal)
        continueButton.tintColor = .white
        continueButton.titleLabel?.font = UIFont.systemFont(ofSize: 16, weight: .semibold)
        continueButton.setTitleColor(.white, for: .normal)
        continueButton.addTarget(self, action: #selector(didTapContinueButton), for: .touchUpInside)
        view.addSubview(continueButton)
    }
    
    func setupConstraints(){
        let size = (view.frame.size.width - 120)/3
        
        NSLayoutConstraint.activate([
            label.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            label.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 30),
            label.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -30),
            
            textField.topAnchor.constraint(equalTo: label.bottomAnchor, constant: 20),
            textField.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 30),
            textField.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -30),
            textField.heightAnchor.constraint(equalToConstant: 45),
            
            collectionView!.topAnchor.constraint(equalTo: textField.bottomAnchor, constant: 20),
            collectionView!.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 30),
            collectionView!.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -30),
            collectionView!.heightAnchor.constraint(equalToConstant: size*3+40),
            
            continueButton.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -44),
            continueButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 32),
            continueButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -32),
            continueButton.heightAnchor.constraint(equalToConstant: 50)
        ])
    }
    
    // --------------------------------------
    // MARK: Overried
    // --------------------------------------
    
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
    // MARK: Actions
    // --------------------------------------
    
    @objc private func didTapContinueButton() {
        
        if textField.text == options[0]{
            ONBOARDDATAMANAGER.typeDocument = .businessCertificate
        } else if textField.text == options[1]{
            ONBOARDDATAMANAGER.typeDocument = .branchRegistrationCertificate
        } else if textField.text == options[2]{
            ONBOARDDATAMANAGER.typeDocument = .businessHousehold
        }
        
        var imageURLs: [URL] = []
        
        for (index, image) in selectedImages.compactMap({ $0 }).enumerated() {
            let fileName = "DOCUMENT_FILE_\(index)_\(Date().millisecondsSince1970).jpg"
            let fileURL = Utils.saveFileToLocal(image, fileName: fileName)
            imageURLs.append(fileURL)
        }
        
        guard !imageURLs.isEmpty else {
            showAlert(message: LOCALIZED("no_image_selected"))
            return
        }
        showActivity()
        if let type = ONBOARDDATAMANAGER.typeDocument {
            switch type {
            case .businessCertificate:
                APISERVICE.verifyOCReKYB(path: "", image: imageURLs, type: type.rawValue) { (result: Result<VerifyDocumentResponseModel<BusinessInfoResponseModel>, Error>) in
                    self.handleAPIResponse(result: result, type: type)
                }
            case .branchRegistrationCertificate:
                APISERVICE.verifyOCReKYB(path: "", image: imageURLs, type: type.rawValue) { (result: Result<VerifyDocumentResponseModel<BranchInfoResponseModel>, Error>) in
                    self.handleAPIResponse(result: result, type: type)
                }
            case .businessHousehold:
                APISERVICE.verifyOCReKYB(path: "", image: imageURLs, type: type.rawValue) { (result: Result<VerifyDocumentResponseModel<BusinessHouseholdResponseModel>, Error>) in
                    self.handleAPIResponse(result: result, type: type)
                }
            }
        } else {
            self.hideActivity()
            showAlert(message: LOCALIZED("please_select_document_type"))
        }
    }
    
    private func handleAPIResponse<T: Decodable>(result: Result<VerifyDocumentResponseModel<T>, Error>,type: VerifyDocumentType) {
        self.hideActivity()
        DispatchQueue.main.async {
            switch result {
            case .success(let response):
                ONBOARDDATAMANAGER.ekybResponse = response
                let summaryVC = SummaryEkybViewController()
                self.navigationController?.pushViewController(summaryVC, animated: true)
            case .failure(let error):
                print("Lỗi xác thực: \(error.localizedDescription)")
            }
        }
    }
    
    private func showAlert(message: String) {
        let alert = UIAlertController(title: LOCALIZED("message_notify"), message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
        present(alert, animated: true, completion: nil)
    }
}


//MARK: - UIPickerViewDelegate, UIPickerViewDataSource

extension EkybUploadDocumentViewController: UIPickerViewDelegate, UIPickerViewDataSource{
    func numberOfComponents(in pickerView: UIPickerView) -> Int {
        return 1
    }
    
    func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int {
        return options.count
    }
    
    func pickerView(_ pickerView: UIPickerView, titleForRow row: Int, forComponent component: Int) -> String? {
        return options[row]
    }
    
    func pickerView(_ pickerView: UIPickerView, didSelectRow row: Int, inComponent component: Int) {
        textField.text = options[row]
        textField.resignFirstResponder()
    }
}

//MARK: - UICollectionViewDelegate, UICollectionViewDataSource, UICollectionViewDelegateFlowLayout

extension EkybUploadDocumentViewController: UICollectionViewDelegate, UICollectionViewDataSource, UICollectionViewDelegateFlowLayout{
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return selectedImages.count + 1
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: PhotoCollectionViewCell.identifier, for: indexPath) as! PhotoCollectionViewCell
        cell.delegate = self
        cell.indexPath = indexPath
        if indexPath.item < selectedImages.count {
            cell.configure(with: selectedImages[indexPath.item])
        } else {
            cell.configure(with: nil)
        }
        return cell
    }
    
}

extension EkybUploadDocumentViewController: PhotoCollectionViewCellDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    
    func didSelectCamera() {
        showImagePicker(sourceType: .camera)
    }
    
    func didSelectPhotoLibrary() {
        showImagePicker(sourceType: .photoLibrary)
    }
    
    func didTapDeleteButton(at index: Int) {
        guard index >= 0, index < selectedImages.count else { return }
        selectedImages.remove(at: index)
        collectionView?.reloadData()
    }
    
    private func showImagePicker(sourceType: UIImagePickerController.SourceType) {
        guard UIImagePickerController.isSourceTypeAvailable(sourceType) else { return }
        
        let imagePicker = UIImagePickerController()
        imagePicker.sourceType = sourceType
        imagePicker.delegate = self
        imagePicker.allowsEditing = false
        present(imagePicker, animated: true, completion: nil)
    }
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        if let selectedImage = info[.editedImage] as? UIImage ?? info[.originalImage] as? UIImage {
            selectedImages.append(selectedImage)
            collectionView?.reloadData()
        }
        picker.dismiss(animated: true, completion: nil)
    }
    
    
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        picker.dismiss(animated: true, completion: nil)
    }
}


