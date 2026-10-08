//
//  PhotoCollectionViewCell.swift
//  xverifydemoapp
//
//  Created by Nguyễn Hiếu on 14/2/25.
//

import UIKit

protocol PhotoCollectionViewCellDelegate: AnyObject {
    func didSelectCamera()
    func didSelectPhotoLibrary()
    func didTapDeleteButton(at index: Int)
}

class PhotoCollectionViewCell: UICollectionViewCell {
    static let identifier = "PhotoCollectionViewCell"
    public var indexPath: IndexPath?
    
    public weak var delegate: PhotoCollectionViewCellDelegate?
    
    private let photoImageView: UIImageView = {
        let imageView = UIImageView()
        imageView.contentMode = .scaleAspectFill
        imageView.clipsToBounds = true
        imageView.translatesAutoresizingMaskIntoConstraints = false
        return imageView
    }()
    
    private let addButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("+", for: .normal)
        button.titleLabel?.font = UIFont.systemFont(ofSize: 40, weight: .bold)
        button.setTitleColor(.gray, for: .normal)
        button.backgroundColor = .clear
        button.translatesAutoresizingMaskIntoConstraints = false
        return button
    }()
    
    private let deleteButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("–", for: .normal)
        button.titleLabel?.font = UIFont.systemFont(ofSize: 24, weight: .bold)
        button.setTitleColor(.red, for: .normal)
        button.backgroundColor = .white
        button.layer.cornerRadius = 12
        button.translatesAutoresizingMaskIntoConstraints = false
        button.isHidden = true
        return button
    }()
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        
        contentView.addSubview(photoImageView)
        contentView.addSubview(addButton)
        contentView.addSubview(deleteButton)
        
        contentView.layer.borderColor = UIColor.gray.cgColor
        contentView.layer.cornerRadius = 8
        contentView.clipsToBounds = true
        
        setupConstraints()
        setupActions()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupConstraints() {
        NSLayoutConstraint.activate([
            photoImageView.topAnchor.constraint(equalTo: contentView.topAnchor),
            photoImageView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            photoImageView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            photoImageView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),
            
            addButton.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            addButton.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            
            deleteButton.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 5),
            deleteButton.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -5),
            deleteButton.widthAnchor.constraint(equalToConstant: 24),
            deleteButton.heightAnchor.constraint(equalToConstant: 24)
        ])
    }
    
    private func setupActions() {
        addButton.addTarget(self, action: #selector(didTapAdd), for: .touchUpInside)
        deleteButton.addTarget(self, action: #selector(didTapDelete), for: .touchUpInside)
    }
    
    @objc private func didTapAdd() {
        showPhotoOptions()
    }
    
    @objc private func didTapDelete() {
            guard let indexPath = indexPath else { return }
            delegate?.didTapDeleteButton(at: indexPath.item)
        }
    
    override func prepareForReuse() {
        super.prepareForReuse()
        configure(with: nil)
    }
    
    public func configure(with image: UIImage?) {
        if let image = image {
            photoImageView.image = image
            addButton.isHidden = true
            deleteButton.isHidden = false
            contentView.layer.borderStyleDashed(false)
        } else {
            photoImageView.image = nil
            addButton.isHidden = false
            deleteButton.isHidden = true
            contentView.layer.borderStyleDashed(true)
        }
    }
    
    private func showPhotoOptions() {
        guard let viewController = findViewController() else { return }
        
        let alertController = UIAlertController(title: LOCALIZED("select_image"), message: nil, preferredStyle: .actionSheet)
        
        let cameraAction = UIAlertAction(title: LOCALIZED("take_photo"), style: .default) { _ in
            self.delegate?.didSelectCamera()
        }
        
        let photoLibraryAction = UIAlertAction(title: LOCALIZED("choose_from_library"), style: .default) { _ in
            self.delegate?.didSelectPhotoLibrary()
        }
        
        let cancelAction = UIAlertAction(title: LOCALIZED("cancel"), style: .cancel, handler: nil)
        
        alertController.addAction(cameraAction)
        alertController.addAction(photoLibraryAction)
        alertController.addAction(cancelAction)
        
        viewController.present(alertController, animated: true, completion: nil)
    }
    
    private func findViewController() -> UIViewController? {
        var responder: UIResponder? = self
        while let nextResponder = responder?.next {
            responder = nextResponder
            if let viewController = responder as? UIViewController {
                return viewController
            }
        }
        return nil
    }
}

extension CALayer {
    func borderStyleDashed(_ isDashed: Bool) {
        if isDashed {
            let dashedBorder = CAShapeLayer()
            dashedBorder.strokeColor = UIColor.gray.cgColor
            dashedBorder.lineDashPattern = [6, 3]
            dashedBorder.frame = bounds
            dashedBorder.fillColor = nil
            dashedBorder.path = UIBezierPath(roundedRect: bounds, cornerRadius: 8).cgPath
            addSublayer(dashedBorder)
        } else {
            sublayers?.removeAll(where: { $0 is CAShapeLayer })
        }
    }
}
