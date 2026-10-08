
import UIKit

class StatusTableCell: UITableViewCell {
    
    @IBOutlet weak var _titleLbl: UILabel!
    @IBOutlet weak var _iconImgView: UIImageView!
    
    // --------------------------------------
    // MARK: Class
    // --------------------------------------

    static var height : CGFloat {
        return 50.0
    }

    // --------------------------------------
    // MARK: Life Cycle
    // --------------------------------------

    override public func awakeFromNib() {
        super.awakeFromNib()
    }

    // --------------------------------------
    // MARK: Public
    // --------------------------------------

    func setup(title: String?, iconImageName: String?, colorCode: UIColor?) {
        _titleLbl.text = !title.isNilOrEmpty ? title : "-"
        _iconImgView.image = UIImage(named: iconImageName ?? "")
        _iconImgView.setImageColor(color: colorCode ?? ColorBrand.appColorDarkGray)
    }
    
}
