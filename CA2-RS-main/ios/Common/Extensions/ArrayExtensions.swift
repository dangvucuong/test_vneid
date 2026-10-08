import Foundation

extension Array where Element: Hashable {
    
    var asBag: [Element: Int] {
        return reduce(into: [:]) {
            $0.updateValue(($0[$1] ?? 0) + 1, forKey: $1)
        }
    }
    
    mutating func remove(object: Element) {
        guard let index = firstIndex(of: object) else { return }
        remove(at: index)
    }
    
	func filterDifference(from other: [Element]) -> [Element] {
		let thisSet = Set(self)
		let otherSet = Set(other)
		return Array(thisSet.symmetricDifference(otherSet))
	}
    
    func containSameElements(_ array: [Element]) -> Bool {
        let selfAsBag = asBag
        let arrayAsBag = array.asBag
        return selfAsBag.count == arrayAsBag.count && selfAsBag.allSatisfy {
            arrayAsBag[$0.key] == $0.value
        }
    }
}
