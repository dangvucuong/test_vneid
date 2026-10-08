import UIKit

class DashboardCollectionCell: UICollectionViewCell {
    
    @IBOutlet weak private var _mainContainerView: UIView!
    @IBOutlet weak private var _iconImgView: UIImageView!
    @IBOutlet weak private var _titleLbl: UILabel!
    
    // --------------------------------------
    // MARK: Class
    // --------------------------------------
    
    static var height: CGFloat = 110.0
        
    // --------------------------------------
    // MARK: Private
    // --------------------------------------
    
    override func awakeFromNib() {
        super.awakeFromNib()
        _mainContainerView.layer.cornerRadius = kCornerRadius
        Graphics.dropShadow(self, color: ColorBrand.appColorDarkGray, opacity: kShadowOpacity, radius: kShadowRadius, offset: kShadowOffset)
    }
    
    // --------------------------------------
    // MARK: Public
    // --------------------------------------

    func setup(title: String?, iconImageName: String?, enable: Bool) {
        _mainContainerView.backgroundColor = enable ? ColorBrand.appColorWhite : .lightGray
        _titleLbl.text = !title.isNilOrEmpty ? title : "-"
        _iconImgView.image = UIImage(named: iconImageName ?? "")
    }

}
