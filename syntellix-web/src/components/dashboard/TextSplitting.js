import React, { useState } from 'react';
import { ChevronDownIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';
import axios from 'axios';
import { useToast } from '../../components/Toast';

// 自定义 Slider 样式
const CustomSlider = styled(Slider)(({ theme }) => ({
  color: '#4f46e5', // primary color
  height: 4,
  padding: '13px 0',
  '& .MuiSlider-track': {
    height: 4,
    backgroundColor: '#4f46e5', // primary color
  },
  '& .MuiSlider-rail': {
    height: 4,
    opacity: 0.5,
    backgroundColor: '#e5e7eb', // bg-secondary color
  },
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active': {
      boxShadow: 'inherit',
    },
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: '#4f46e5', // primary color
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
}));

// 在组件外部或使用 useMemo 创建这个对象以优化性能
const methodDescriptions = {
    naive: {
        title: '"通用"分块方法说明',
        formats: 'DOCX、EXCEL、PPT、IMAGE、PDF、TXT、MD、JSON、EML、HTML',
        steps: [
            '使用视觉检测模型将文本智能分割为多个语义片段。',
            '将这些片段合并成不超过设定"Token数"的连续块。'
        ]
    },
    qa: {
        title: '"问答"分块方法说明',
        formats: 'EXCEL、CSV、TXT',
        rules: [
            'Excel 文件：需要两列（无标题），第一列为问题，第二列为答案。可接受多个工作表。',
            'CSV/TXT 文件：使用分隔符区分问题和答案。',
            '不符合规则的文本行将被忽略。',
            '每个问答对被视为一个独立的部分。'
        ]
    },
    resume: {
        title: '"简历"分块方法说明',
        formats: 'DOCX、PDF、TXT',
        description: [
            '简历有多种格式，就像一个人的个性一样，但我们经常必须将它们组织成结构化数据，以便于搜索。',
            '我们不是将简历分块，而是将简历解析为结构化数据。',
            "作为HR，你可以扔掉所有的简历，您只需与'RAGFlow'交谈即可列出所有符合资格的候选人。"
        ]
    },
    manual: {
        title: '"手册"分块方法说明',
        formats: 'PDF',
        description: [
            '我们假设手册具有分层部分结构。',
            '我们使用最低的部分标题作为对文档进行切片的枢轴。',
            '因此，同一部分中的图和表不会被分割，并且块大小可能会很大。'
        ]
    },
    table: {
        title: '"表格"分块方法说明',
        formats: 'EXCEL、CSV、TXT',
        rules: [
            '对于 csv 或 txt 文件，列之间的分隔符为 TAB。',
            '第一行必须是列标题。',
            '列标题必须是有意义的术语，以便我们的大语言模型能够理解。',
            "列举同义词时最好使用斜杠'/'来分隔，甚至更好使用方括号枚举值，例如 'gender/sex(male,female)'。",
            '表中的每一行都将被视为一个块。'
        ],
        examples: [
            "供应商/供货商'TAB'颜色（黄色、红色、棕色）'TAB'性别（男、女）'TAB'尺码（M、L、XL、XXL）",
            "姓名/名字'TAB'电话/手机/微信'TAB'最高学历（高中，职高，硕士，本科，博士，初中，中技，中专，专科，专升本，MPA，MBA，EMBA）"
        ]
    },
    paper: {
        title: '"论文"分块方法说明',
        formats: 'PDF',
        description: [
            '仅支持PDF文件。',
            '如果我们的模型运行良好，论文将按其部分进行切片，例如摘要、1.1、1.2等。',
            '这样做的好处是LLM可以更好的概括论文中相关章节的内容，产生更全面的答案，帮助读者更好地理解论文。',
            "缺点是它增加了 LLM 对话的背景并增加了计算成本，所以在对话过程中，你可以考虑减少'topN'的设置。"
        ]
    },
    book: {
        title: '"书籍"分块方法说明',
        formats: 'DOCX、PDF、TXT',
        description: [
            '由于一本书很长，并不是所有部分都有用，如果是 PDF，请为每本书设置页面范围，以消除负面影响并节省分析计算时间。'
        ]
    },
    laws: {
        title: '"法律"分块方法说明',
        formats: 'DOCX、PDF、TXT',
        description: [
            '法律文件有非常严格的书写格式。我们使用文本特征来检测分割点。',
            "chunk的粒度与'ARTICLE'一致，所有上层文本都会包含在chunk中。"
        ]
    },
    presentation: {
        title: '"演示文稿"分块方法说明',
        formats: 'PDF、PPTX',
        description: [
            '每个页面都将被视为一个块。并且每个页面的缩略图都会被存储。',
            '您上传的所有PPT文件都会使用此方法自动分块，无需为每个PPT文件进行设置。'
        ]
    },
    one: {
        title: '"整体"分块方法说明',
        formats: 'DOCX、EXCEL、PDF、TXT',
        description: [
            '对于一个文档，它将被视为一个完整的块，根本不会被分割。',
            '如果你要总结的东西需要一篇文章的全部上下文，并且所选LLM的上下文长度覆盖了文档长度，你可以尝试这种方法。'
        ]
    },
    picture: {
        title: '"图片"分块方法说明',
        formats: 'IMAGE',
        description: [
            '图片分块方法用于处理图片文件。',
            '它将图片分割成多个块，每个块包含图片的一部分。',
            '这样做可以提高图片处理的效率和准确性。'
        ]
    },
    audio: {
        title: '"音频"分块方法说明',
        formats: 'MP3、WAV、OGG',
        description: [
            '音频分块方法用于处理音频文件。',
            '它将音频分割成多个块，每个块包含音频的一部分。',
            '这样做可以提高音频处理的效率和准确性。'
        ]
    },
    email: {
        title: '"邮件"分块方法说明',
        formats: 'EML',
        description: [
            '邮件分块方法用于处理邮件文件。',
            '它将邮件分割成多个块，每个块包含邮件的一部分。',
            '这样做可以提高邮件处理的效率和准确性。'
        ]
    },
    knowledge_graph: {
        title: '"知识图谱"分块方法说明',
        formats: 'JSON',
        description: [
            '知识图谱分块方法用于处理知识图谱文件。',
            '它将知识图谱分割成多个块，每个块包含知识图谱的一部分。',
            '这样做可以提高知识图谱处理的效率和准确性。'
        ]
    },
    // 为其他方法添加描述...
};

function TextSplitting({ onNextStep, onPreviousStep, knowledgeBaseId, fileIds }) {
    const [splitConfig, setSplitConfig] = useState({
        method: 'naive', // 默认设置为 'naive'，对应"通用"
        chunkSize: 1024,
        separator: '\\n!?。；！？',
        layoutAware: true
    });
    const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const { showToast } = useToast();

    const handleConfigChange = (name, value) => {
        setSplitConfig(prevConfig => ({
            ...prevConfig,
            [name]: value
        }));
    };

    const methods = [
        { name: '通用', value: 'naive' },
        { name: '表格', value: 'table' },
        { name: '问答', value: 'qa' },
        { name: '简历', value: 'resume' },
        { name: '手册', value: 'manual' },
        { name: '论文', value: 'paper' },
        { name: '书籍', value: 'book' },
        { name: '法律', value: 'laws' },
        { name: '演示文稿', value: 'presentation' },
        { name: '整体', value: 'one' },
        { name: '图片', value: 'picture' },
        { name: '音频', value: 'audio' },
        { name: '邮件', value: 'email' },
        { name: '知识图谱', value: 'knowledge_graph' },
    ];

    const handleSaveAndProcess = async () => {
        setError('');
        setIsProcessing(true);
        try {
            const response = await axios.post(`/console/api/knowledge-bases/${knowledgeBaseId}/documents`, {
                data_source: {
                    type: 'upload_file',
                },
                file_ids: fileIds,
                parser_type: splitConfig.method,
                parser_config: {
                    chunk_size: splitConfig.chunkSize,
                    separator: splitConfig.separator,
                    layout_aware: splitConfig.layoutAware
                }
            });

            console.log('Documents processed:', response.data);
            showToast('保存成功', 'success');
            onNextStep(knowledgeBaseId, fileIds);
        } catch (error) {
            console.error('Error processing documents:', error);
            setError(error.response?.data?.message || '保存失败，请重试。');
            showToast('保存失败', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-lg shadow-sm p-6 space-y-6">
                <h3 className="text-lg font-semibold text-text-body font-noto-sans-sc">文本分段配置</h3>
                <div className="flex space-x-8">
                    <div className="w-1/3 pr-8 pl-8 border-r border-bg-secondary">
                        <div className="space-y-6 pr-8">
                            <div>
                                <label className="block text-sm font-semibold text-text-body mb-2 font-noto-sans-sc">解析方法</label>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsMethodDropdownOpen(!isMethodDropdownOpen)}
                                        className="w-full bg-bg-secondary border border-bg-tertiary rounded-lg py-2 px-4 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                    >
                                        <span className="block truncate text-text-body">
                                            {methods.find(m => m.value === splitConfig.method)?.name || '通用'}
                                        </span>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                            <ChevronDownIcon className="h-5 w-5 text-text-muted" aria-hidden="true" />
                                        </span>
                                    </button>
                                    {isMethodDropdownOpen && (
                                        <div className="absolute z-10 mt-1 w-full bg-bg-primary shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                            {methods.map((method) => (
                                                <div
                                                    key={method.value}
                                                    className={`${
                                                        method.value === splitConfig.method ? 'bg-primary bg-opacity-10 text-primary' : 'text-text-body'
                                                    } cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-primary hover:bg-opacity-5`}
                                                    onClick={() => {
                                                        handleConfigChange('method', method.value);
                                                        setIsMethodDropdownOpen(false);
                                                    }}
                                                >
                                                    <span className={`${method.value === splitConfig.method ? 'font-semibold' : 'font-normal'} block truncate`}>
                                                        {method.name}
                                                    </span>
                                                    {method.value === splitConfig.method && (
                                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {splitConfig.method === 'naive' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-text-body mb-2 font-noto-sans-sc">块Token数</label>
                                        <div className="flex items-center space-x-4">
                                            <CustomSlider
                                                value={splitConfig.chunkSize}
                                                onChange={(_, newValue) => handleConfigChange('chunkSize', newValue)}
                                                aria-labelledby="chunk-size-slider"
                                                valueLabelDisplay="auto"
                                                step={1}
                                                marks
                                                min={0}
                                                max={2048}
                                            />
                                            <input
                                                type="number"
                                                name="chunkSize"
                                                value={splitConfig.chunkSize}
                                                onChange={(e) => handleConfigChange('chunkSize', e.target.value)}
                                                className="w-20 px-3 py-2 text-text-body bg-bg-secondary border border-bg-tertiary rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm font-noto-sans-sc"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-text-body mb-2 font-noto-sans-sc">分段标识符</label>
                                        <input
                                            type="text"
                                            name="separator"
                                            value={splitConfig.separator}
                                            onChange={(e) => handleConfigChange('separator', e.target.value)}
                                            className="block w-full px-3 py-2 text-text-body bg-bg-secondary border border-bg-tertiary rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm font-noto-sans-sc"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-text-body font-noto-sans-sc flex items-center">
                                                布局识别
                                                <div className="relative group ml-1">
                                                    <QuestionMarkCircleIcon className="h-5 w-5 text-text-muted cursor-help" aria-hidden="true" />
                                                    <div className="absolute z-10 w-64 p-2 bg-bg-primary rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 text-xs text-text-body left-1/2 -translate-x-1/2 top-6">
                                                        启用此选项可以更好地保留文档的原始布局结构
                                                    </div>
                                                </div>
                                            </span>
                                        </div>
                                        <label className="flex items-center space-x-3 cursor-pointer mb-2">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    name="layoutAware"
                                                    checked={splitConfig.layoutAware}
                                                    onChange={(e) => handleConfigChange('layoutAware', e.target.checked)}
                                                    className="sr-only"
                                                />
                                                <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                                                    splitConfig.layoutAware ? 'bg-primary' : 'bg-bg-tertiary'
                                                }`}></div>
                                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                                                    splitConfig.layoutAware ? 'transform translate-x-4' : ''
                                                }`}></div>
                                            </div>
                                            <span className="text-sm text-text-body font-noto-sans-sc">
                                                {splitConfig.layoutAware ? '已启用' : '未启用'}
                                            </span>
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="w-2/3 pl-8">
                        <h4 className="text-lg font-semibold text-text-body mb-4 font-noto-sans-sc">
                            {methodDescriptions[splitConfig.method]?.title || '方法说明'}
                        </h4>
                        <p className="text-sm text-text-body mb-4 font-noto-sans-sc">
                            支持的文件格式：
                            <span className="font-bold font-tech">
                                {methodDescriptions[splitConfig.method]?.formats || ''}
                            </span>
                        </p>
                        {methodDescriptions[splitConfig.method]?.description && (
                            <div className="mb-4">
                                {methodDescriptions[splitConfig.method].description.map((item, index) => (
                                    <p key={index} className="text-sm text-text-body mb-2 font-noto-sans-sc">{item}</p>
                                ))}
                            </div>
                        )}
                        {(methodDescriptions[splitConfig.method]?.steps || methodDescriptions[splitConfig.method]?.rules) && (
                            <>
                                <p className="text-sm text-text-body mb-4 font-noto-sans-sc">
                                    {splitConfig.method === 'naive' ? '此方法采用以下步骤处理文件：' : '此方法采用以下规则处理文件：'}
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-text-body font-noto-sans-sc">
                                    {(methodDescriptions[splitConfig.method]?.steps || methodDescriptions[splitConfig.method]?.rules || []).map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {methodDescriptions[splitConfig.method]?.examples && (
                            <div className="mt-4">
                                <p className="text-sm font-semibold text-text-body mb-2 font-noto-sans-sc">标题行示例：</p>
                                {methodDescriptions[splitConfig.method].examples.map((example, index) => (
                                    <p key={index} className="text-sm text-text-muted mb-1 font-mono">{example}</p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {error && (
                <div className="bg-danger bg-opacity-10 border border-danger text-danger px-4 py-3 rounded relative text-sm" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div className="flex items-center space-x-4">
                <button
                    onClick={onPreviousStep}
                    className="text-sm font-semibold py-2 px-6 rounded-lg flex items-center justify-center transition-colors duration-200 bg-bg-secondary hover:bg-bg-tertiary text-text-body"
                    disabled={isProcessing}
                >
                    <span className="font-noto-sans-sc">上一步</span>
                </button>
                <button
                    onClick={handleSaveAndProcess}
                    className="text-sm font-semibold py-2 px-6 rounded-lg flex items-center justify-center transition-colors duration-200 bg-primary hover:bg-primary-dark text-bg-primary"
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                            <span className="font-noto-sans-sc">处理中...</span>
                        </>
                    ) : (
                        <span className="font-noto-sans-sc">保存并处理</span>
                    )}
                </button>
            </div>
        </div>
    );
}

export default TextSplitting;