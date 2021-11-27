export const uploadBroadcastWithPlanMailTitle = "【Musiy】{{artist.name}}さんが{{content.title}}を配信予定";
export const uploadBroadcastWithPlanMailContext = `
{{user.name}}様<br>
<br>
{{artist.name}}さんが「{{plan.name}} {{plan.description}}」のプラン内で{{content.title}}を配信予定です。<br>
<br>
{{#escapeHtmlWithoutBr content.description}}{{/escapeHtmlWithoutBr}}<br>
<br>
{{content.url}}<br>
`;
