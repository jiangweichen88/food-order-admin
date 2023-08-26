import { get } from 'lodash-es'
class _data_Dictionary {
  constructor(data) {
    this._data_ = data
    data.forEach((item) => {
      this[item.name] = item
    })
  }

  // 获取所有key
  getAllKeys() {
    return this._data_.map((item) => item.key)
  }

  // 获取所有name
  getAllNames() {
    return this._data_.map((item) => item.name)
  }

  // 根据key获取对应的name
  getName(key) {
    return get(
      this._data_.find((item) => item.key == key),
      'name'
    )
  }

  // 根据name获取对应的key
  getKey(name) {
    return this._data_.find((item) => item.name === name).key
  }
}
export default _data_Dictionary
