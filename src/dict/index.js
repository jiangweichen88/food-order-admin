import i18n from '@/lang'
import DataDictionary from './dict'
const typeOptions=new DataDictionary([
  { key: "1", name: "素菜" },
  { key: "2", name: "荤菜" },
  { key: "3", name: "主食" },
])
const statusOptions=new DataDictionary( [{
  name: "上架",
  key: 1,
},
{
  name: "下架",
  key: 0,
}])
const orderStatusOptions=new DataDictionary( [{
  name: "已预定",
  key: "1",
},
{
  name: "已取消",
  key: "0",
}])
const auditStatusOptions=new DataDictionary( [{
  name: "已审核",
  key: 1,
},
{
  name: "未审核",
  key: 0,
}])
export { typeOptions,statusOptions,orderStatusOptions,auditStatusOptions}
