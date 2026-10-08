//
//  ShowImageViewController.swift
//  xverifydemoapp
//
//  Created by Huynh Minh Hieu on 21/03/2024.
//

import UIKit

enum ShowMode {
    case potrait
    case landscape
}


class ShowImageViewController: ChildViewController {
    public var imagePath: String = ""
    public var showMode: ShowMode = .landscape
    
    //contraints
    
    
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var potraitImageView: UIImageView!
    @IBOutlet weak var mainScrollView: UIScrollView!
    var originalPosition: CGPoint?
    var currentPositionTouched: CGPoint?
    
    
    private var oldContentSizeHeight: CGFloat = 0.0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupScrollView()
        setupLayout()
        view.addGestureRecognizer(UIPanGestureRecognizer(target: self, action: #selector(onPanDown(_:))))
        
    }
    
    private func setupScrollView() {
        mainScrollView.minimumZoomScale = 1
        mainScrollView.maximumZoomScale = 3
        mainScrollView.showsHorizontalScrollIndicator = false
        mainScrollView.showsVerticalScrollIndicator = false
        mainScrollView.delegate = self
        mainScrollView.alwaysBounceHorizontal = false
    }
        
    private func setupLayout() {
        switch self.showMode {
        case .potrait:
            self.imageView.isHidden = true
            setupImageView(potraitImageView, imagePath: imagePath)
        case .landscape:
            self.potraitImageView.isHidden = true
            setupImageView(imageView, imagePath: imagePath)
        }
    }
    
    private func setupImageView(_ imageView: UIImageView, imagePath: String) {
                if let uriImage = URL(string: imagePath) {
                    do {
                        let imageData = try Data(contentsOf: uriImage)
                        let image = UIImage(data: imageData)
        
                        imageView.contentMode = .scaleAspectFill
                        imageView.clipsToBounds = true
        
                        imageView.image = image
                    } catch {
                        print("Error loading image : \(error)")
                    }
                }
        
        imageView.addGestureRecognizer(UIPanGestureRecognizer(target: self, action: #selector(onPanDown(_:))))
    }
    
    @objc func handleDimiss(_ sender: UITapGestureRecognizer) {
        self.dismiss(animated: true)
    }
    
    @objc func onPanDown(_ panGesture: UIPanGestureRecognizer) {
        let translation = panGesture.translation(in: view)
        if panGesture.state == .began {
            originalPosition = view.center
            currentPositionTouched = panGesture.location(in: view)
        } else if panGesture.state == .changed,  panGesture.velocity(in: view).y > 0  {
            view.frame.origin = CGPoint(
                x:  view.frame.origin.x,
                y:  view.frame.origin.y + translation.y
            )
            panGesture.setTranslation(CGPoint.zero, in: self.view)
        } else if panGesture.state == .ended {
            let velocity = panGesture.velocity(in: view)
            if velocity.y >= 150 {
                UIView.animate(withDuration: 0.2
                               , animations: {
                    self.view.frame.origin = CGPoint(
                        x: self.view.frame.origin.x,
                        y: self.view.frame.size.height
                    )
                }, completion: { (isCompleted) in
                    if isCompleted {
                        self.dismiss(animated: false, completion: nil)
                    }
                })
            } else {
                UIView.animate(withDuration: 0.2, animations: {
                    self.view.center = self.originalPosition!
                })
            }
        }
    }
    
    
    
    private func updateConstraintsForSize(_ imageView: UIImageView) {
        UIView.animate(withDuration: 0.2) { [weak self] in
            guard let self = self else {return}
            imageView.snp.updateConstraints { make in
                make.top.equalTo(self.view.snp.top).offset(self.view.bounds.height/2 - imageView.frame.height/2)
            }
            self.view.layoutIfNeeded()
        }
        
    }
}

extension ShowImageViewController: UIScrollViewDelegate {
    func viewForZooming(in scrollView: UIScrollView) -> UIView? {
        return showMode == .landscape ? imageView : potraitImageView
    }
    
}
