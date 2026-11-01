// Branded HTML email layout. Email clients ignore most CSS, so everything is inline and table based.
const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const FONT = "Arial, Helvetica, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

function emailLayout({ title, preheader = '', content, buttonText, buttonUrl }) {
  const button =
    buttonText && buttonUrl
      ? `
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 12px;">
          <tr>
            <td style="border-radius:10px;background:#dc2626;">
              <a href="${buttonUrl}" style="display:inline-block;padding:14px 30px;font-family:${FONT};font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">${escapeHtml(buttonText)}</a>
            </td>
          </tr>
        </table>
        <p style="margin:0;font-family:${FONT};font-size:12px;line-height:18px;color:#78716c;">
          Button not working? Copy and paste this link into your browser:<br>
          <a href="${buttonUrl}" style="color:#dc2626;word-break:break-all;">${buttonUrl}</a>
        </p>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">
          <tr>
            <td style="background:#1c1917;padding:24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:14px;"><img src="cid:logo" width="52" height="52" alt="SliceCraft" style="display:block;border-radius:26px;"></td>
                  <td>
                    <div style="font-family:${SERIF};font-size:24px;font-weight:bold;color:#ffffff;line-height:28px;">SliceCraft</div>
                    <div style="font-family:${FONT};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#f59e0b;">Artisanal Pizzeria</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:4px;background:#f59e0b;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:36px 32px 32px;font-family:${FONT};font-size:15px;line-height:24px;color:#292524;">
              <h1 style="margin:0 0 16px;font-family:${SERIF};font-size:26px;line-height:32px;color:#1c1917;">${escapeHtml(title)}</h1>
              ${content}
              ${button}
            </td>
          </tr>
          <tr>
            <td style="background:#fafaf9;border-top:1px solid #e7e5e4;padding:20px 32px;font-family:${FONT};font-size:12px;line-height:18px;color:#78716c;">
              You are receiving this email because of activity on your SliceCraft account.<br>
              &copy; 2026 SliceCraft. Build it your way.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { emailLayout, escapeHtml };
